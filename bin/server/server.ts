import { serve, ServerType } from '@hono/node-server';
import { Hono } from 'hono';
import { CliOptions } from '../types';
import { getRequestFromCache } from './getRequestFromCache';
import { proxy } from './proxy';

export class Server {
  private server: ServerType | null = null;

  public async listen(options: CliOptions) {
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

  public stopServer() {
    if (!this.server) {
      return;
    }

    this.server?.close();
    this.server = null;
  }

  public getStatus() {
    return Boolean(this.server);
  }
}

export const server = new Server();
