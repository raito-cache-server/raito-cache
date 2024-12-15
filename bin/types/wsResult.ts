import { CacheCommand } from './wsCommands';
import { ICache } from './cache';

export type WsResult = {
  error?: string;
  command?: CacheCommand;
  key?: string;
  success?: boolean;
  data?: ICache | null;
};
