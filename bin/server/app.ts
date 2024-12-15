import { CliOptions } from '../types';
import { HttpServer } from './httpServer';
import { WsServer } from './wsServer';

export type ServerName = 'ws' | 'http';

export class App {
  private httpServer: HttpServer | null = null;
  private wss: WsServer | null = null;
  private options: CliOptions | undefined;

  public async bootstrap(options: CliOptions) {
    this.options = options;

    this.httpServer = new HttpServer(options);
    this.wss = new WsServer(options);

    if (this.options.http) {
      await this.httpServer.listen();
    }
    await this.wss.listen();
  }

  public async startServers(server?: ServerName) {
    const startMap = {
      ws: async () => await this.wss?.listen(),
      http: async () => this.httpServer?.listen(),
    };

    if (server) {
      await startMap[server]?.();
    } else {
      for (const start of Object.values(startMap)) {
        await start();
      }
    }
  }

  public stopServers(server?: ServerName) {
    const stopMap = {
      ws: () => this.wss?.stopServer(),
      http: () => this.httpServer?.stopServer(),
    };

    if (server) {
      stopMap[server]?.();
    } else {
      Object.values(stopMap).forEach((stop) => stop());
    }
  }

  public getServersStatus() {
    return { ws: this.wss?.getStatus(), http: this.httpServer?.getStatus() };
  }
}
export const app = new App();
