import { WebSocket, WebSocketServer } from 'ws';
import {
  CacheCommand,
  WsCommand,
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

        if (handler[WsCommand[command]]) {
          handler[WsCommand[command]]();
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

    const cacheTtl = Number(ttl);
    cacheStore.set(new Cache(key, data, cacheTtl));
    ws.send(JSON.stringify({ command: 'set', key, success: true } as WsResult));
  }

  private handleClearCache(ws: WebSocket, key?: string) {
    cacheStore.clear(key);
    ws.send(
      JSON.stringify({
        command: 'clear-cache',
        key,
        success: true,
      } as WsResult),
    );
  }
}
