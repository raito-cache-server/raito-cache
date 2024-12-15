export interface IServer {
  listen(): Promise<void>;
  stopServer(): void;
  getStatus(): boolean;
}
