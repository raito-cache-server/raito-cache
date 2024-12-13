import { serve, ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { CliOptions } from '../types';
import { getRequestFromCache } from './getRequestFromCache';
import { proxy } from './proxy';
import { WebSocketServer, WebSocket } from 'ws';
import { Cache, cacheStore } from '../cache';
import { CacheCommand, WsCommand } from '../types/wsCommands';
import { WsMessage } from '../types/wsMessage';

export class Server {
  private server: ServerType | null = null;
  private wss: WebSocketServer | null = null;

  public async listen(options: CliOptions) {
    await this.createHttpServer(options);
    await this.createWebSocketServer(options);
  }

  public stopServer() {
    if (!this.server && !this.wss) {
      return;
    }

    this.server?.close();
    this.wss?.close();
    this.wss = null;
    this.server = null;
  }

  public getStatus() {
    return Boolean(this.server);
  }

  private async createHttpServer(options: CliOptions) {
    if (this.server) {
      return;
    }

    const app = new Hono();
    const port = options.port;
    const hostname = options.host;

    app.get('/status', (c) => c.text('OK'));
    app.use(getRequestFromCache);
    app.all('*', proxy);

    this.server = serve({
      fetch: app.fetch,
      port,
      hostname,
    });
  }

  private async createWebSocketServer(options: CliOptions) {
    if (this.wss) {
      return;
    }

    this.wss = new WebSocketServer({
      port: Number(options.port) + 1,
      host: options.host,
    });

    this.wss.on('connection', (ws) => {
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
          ws.send(JSON.stringify({ error: 'Unknown command' }));
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected.');
      });
    });
  }

  private handleGet(ws: any, key: string) {
    const entries = cacheStore.get(key);
    ws.send(
      JSON.stringify({
        command: 'get',
        key,
        data: entries,
      }),
    );
  }

  private handleSet(ws: WebSocket, key: string, data?: string, ttl?: string) {
    if (!key || !data) {
      ws.send(JSON.stringify({ error: 'Missing required arguments' }));
      return;
    }

    const cacheTtl = Number(ttl);
    cacheStore.set(new Cache(key, data, cacheTtl));
    ws.send(JSON.stringify({ command: 'set', key, success: true }));
  }

  private handleClearCache(ws: WebSocket, key?: string) {
    cacheStore.clear(key);
    ws.send(JSON.stringify({ command: 'clear-cache', key, success: true }));
  }
}

export const server = new Server();
