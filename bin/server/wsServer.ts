import { WebSocket, WebSocketServer } from 'ws';
import {
  CacheCommand,
  WsMessage,
  WsResult,
  CliOptions,
  IServer,
} from '../types';
import { Cache, cacheStore } from '../cache';
import * as bcrypt from 'bcrypt';

export class WsServer implements IServer {
  private server: WebSocketServer | null = null;
  private authenticatedClients = new WeakMap<WebSocket, boolean>();

  constructor(private readonly options: CliOptions) {}

  public async listen() {
    if (this.server) {
      return;
    }

    const { port, host, password } = this.options;

    this.server = new WebSocketServer({
      port,
      host,
    });

    this.server.on('connection', (ws) => {
      console.log('WebSocket client connected.');

      this.authenticatedClients.set(ws, !password);

      ws.on('message', (message) => {
        const { command, args }: WsMessage = JSON.parse(message.toString());

        if (command === 'auth') {
          this.handleAuth(ws, args[0]);
          return;
        }

        if (!this.authenticatedClients.get(ws)) {
          ws.send(
            JSON.stringify({
              error: 'Unauthorized. Please authenticate.',
            } as WsResult),
          );
          console.log('Client authentication failed.');
          return;
        }

        const handler: Record<Exclude<CacheCommand, 'auth'>, () => void> = {
          set: () => {
            this.handleSet(ws, ...args);
          },
          get: () => {
            this.handleGet(ws, args[0]);
          },
          'clear-cache': () => {
            this.handleClearCache(ws, args[0]);
          },
        };

        if (handler[command]) {
          handler[command]();
        } else {
          ws.send(JSON.stringify({ error: 'Unknown command' } as WsResult));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected.');
        this.authenticatedClients.delete(ws);
      });
    });
  }

  public getStatus() {
    return Boolean(this.server);
  }

  public stopServer() {
    if (!this.server) {
      return;
    }

    this.server.close();
    this.server = null;
  }

  private handleAuth(ws: WebSocket, password: string) {
    const serverPassword = this.options.password;
    const passwordsMatch = bcrypt.compareSync(
      password,
      this.options.password || '',
    );

    if (!serverPassword || (serverPassword && passwordsMatch)) {
      this.authenticatedClients.set(ws, true);
      ws.send(JSON.stringify({ command: 'auth', success: true } as WsResult));
      console.log('Client authenticated successfully.');
    } else {
      ws.send(
        JSON.stringify({
          command: 'auth',
          success: false,
          error: 'Invalid password',
        } as WsResult),
      );
      console.log('Client authentication failed.');
    }
  }

  private handleGet(ws: WebSocket, key: string) {
    const record = cacheStore.strictGet(key);
    console.log(`WS: get ${key}`);
    ws.send(
      JSON.stringify({
        command: 'get',
        key,
        data: record,
        success: true,
      } as WsResult),
    );
  }

  private handleSet(ws: WebSocket, key: string, data?: string, ttl?: string) {
    if (!key || !data) {
      ws.send(
        JSON.stringify({ error: 'Missing required arguments' } as WsResult),
      );
      return;
    }

    const cacheTtl = ttl ? Number(ttl) : undefined;
    cacheStore.set(new Cache(key, data, cacheTtl));
    console.log(`WS: set ${key} ${JSON.stringify(data)} ${cacheTtl}`);
    ws.send(JSON.stringify({ command: 'set', key, success: true } as WsResult));
  }

  private handleClearCache(ws: WebSocket, key?: string) {
    cacheStore.clear(key);
    console.log(`WS: clear-cache ${key}`);
    ws.send(
      JSON.stringify({
        command: 'clear-cache',
        key,
        success: true,
      } as WsResult),
    );
  }
}
