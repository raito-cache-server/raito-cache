import { CacheCommand } from './wsCommands';

export type WsMessage = {
  command: CacheCommand;
  args: [string, string?, string?];
};
