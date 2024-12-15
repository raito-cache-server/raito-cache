import { serve, ServerType } from '@hono/node-server';
import { IServer, CliOptions } from '../types';
import { Hono } from 'hono';
import { getRequestFromCache } from './getRequestFromCache';
import { proxy } from './proxy';

export class HttpServer implements IServer {
  private server: ServerType | null = null;

  constructor(private readonly options: CliOptions) {}

  public async listen() {
    if (this.server) {
      return;
    }

    const app = new Hono();
    const port = Number(this.options.port) + 1;
    const hostname = this.options.host;

    app.use(getRequestFromCache);
    app.all('*', proxy);

    this.server = serve({
      fetch: app.fetch,
      port: port,
      hostname,
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
}
