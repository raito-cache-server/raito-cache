import { ICache } from './cache';

export interface ICacheStore {
  set(data: ICache): void;
  get(key?: string): ICache | Map<string, ICache> | null;
  clear(): void;
}
