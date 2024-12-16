import { WebSocket, WebSocketServer } from 'ws';
import {
  CacheCommand,
  WsMessage,
  WsResult,
  CliOptions,
  IServer,
} from '../types';
import { Cache, cacheStore } from '../cache';

export class WsServer implements IServer {
  private server: WebSocketServer | null = null;

  constructor(private readonly options: CliOptions) {}

  public async listen() {
    if (this.server) {
      return;
    }

    const port = this.options.port;
    const host = this.options.host;

    this.server = new WebSocketServer({
      port,
      host,
    });

    this.server.on('connection', (ws) => {
      console.log('WebSocket client connected.');

      ws.on('message', (message) => {
        const { command, args }: WsMessage = JSON.parse(message.toString());

        const handler: Record<CacheCommand, () => void> = {
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

  private handleGet(ws: any, key: string) {
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
