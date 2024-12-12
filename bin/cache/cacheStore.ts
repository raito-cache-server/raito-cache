import { ICache, ICacheStore } from '../types';
import { options } from '../cli';
import chalk from 'chalk';

export type CacheMap = Map<string, ICache>;

class CacheStore implements ICacheStore {
  private cachettl: number | undefined = undefined;
  private readonly cacheMap: CacheMap = new Map<string, ICache>();

  public set(data: ICache): void {
    if (!data.ttl) {
      data.setTtl(this.cachettl);
    }
    this.cacheMap.set(data.key, data);
  }

  public get(key?: string): ICache | CacheMap | null {
    this.removeExpiredEntries();

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
    if (key) {
      if (this.cacheMap.has(key)) {
        this.cacheMap.delete(key);
      }
      return console.error(
        chalk.bold.red(`ERROR: `) + `No record by key: ${key} found`,
      );
    } else {
      this.cacheMap.clear();
      console.log(chalk.green('Cleared'));
    }
  }

  private removeExpiredEntries() {
    const now = Date.now();
    Array.from(this.cacheMap.entries()).forEach(([key, cache]) => {
      const createdAt = cache.createdAt.getTime();
      const ttl = cache.ttl ?? options.ttl;
      if (ttl > 0 && now - createdAt >= ttl) {
        this.cacheMap.delete(key);
      }
    });
  }

  public ttl(value?: number) {
    if (!value && value !== 0) {
      return this.cachettl;
    } else {
      this.cachettl = value;
    }
  }
}

export const cacheStore = new CacheStore();
