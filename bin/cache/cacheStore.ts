import { ICache, ICacheStore } from '../types';

export type CacheMap = Map<string, ICache>;

class CacheStore implements ICacheStore {
  private readonly cacheMap: CacheMap = new Map<string, ICache>();

  public set(data: ICache): void {
    this.cacheMap.set(data.key, data);
  }

  public get(key?: string): ICache | CacheMap | null {
    if (!key) return null;
    if (key === '*') {
      return new Map(this.cacheMap);
    }

    const item = this.cacheMap.get(key);
    if (item) {
      return item;
    }

    const [methodPattern, routePattern] = key.split(':');
    if (methodPattern && routePattern) return null;

    const matchedItems = Array.from(this.cacheMap.entries()).filter(
      ([cacheKey]) => {
        return (
          (routePattern !== '' && cacheKey.includes(routePattern)) ||
          (methodPattern !== '' && cacheKey.split(':')[0] === methodPattern)
        );
      },
    );

    if (matchedItems.length > 0) {
      return new Map(matchedItems);
    }
    return null;
  }

  public clear(key?: string): void {
    if (key) this.cacheMap.delete(key);
    else this.cacheMap.clear();
  }
}

export const cacheStore = new CacheStore();
