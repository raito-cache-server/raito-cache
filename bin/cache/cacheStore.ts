import { ICache, ICacheStore } from '../types';

class CacheStore implements ICacheStore {
  private readonly cacheMap: Map<string, ICache> = new Map<string, ICache>();

  public set(data: ICache): void {
    this.cacheMap.set(data.key, data);
  }

  public get(key: string): ICache | null {
    const item = this.cacheMap.get(key);
    return item ? item : null;
  }

  public clear(): void {
    this.cacheMap.clear();
  }
}

export const cacheStore = new CacheStore();
