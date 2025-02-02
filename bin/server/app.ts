import { CliOptions } from '../types';
import { WsServer } from './wsServer';

export class App {
  private wss: WsServer | null = null;
  private options: CliOptions | undefined;

  public async bootstrap(options: CliOptions) {
    this.options = options;

    this.wss = new WsServer(options);

    await this.wss.listen();
  }

  public async startServer() {
    await this.wss?.listen();
  }

  public stopServer() {
    this.wss?.stopServer();
  }

  public getServersStatus() {
    return this.wss?.getStatus();
  }
}
export const app = new App();
