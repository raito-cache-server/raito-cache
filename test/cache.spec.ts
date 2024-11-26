import { Cache, cacheStore } from '../bin/cache';

describe('Cache', () => {
  it('should create a Cache instance with the correct key and data', () => {
    const cache = new Cache('key1', { name: 'test' });

    expect(cache.key).toBe('key1');
    expect(cache.data).toBe(JSON.stringify({ name: 'test' }));
  });
});

describe('CacheStore', () => {
  beforeEach(() => {
    cacheStore.clear();
  });

  it('should store a Cache instance correctly', () => {
    const cache = new Cache('key1', { name: 'test' });
    cacheStore.set(cache);

    const cachedData = cacheStore.get('key1');
    expect(cachedData).toBeDefined();
    expect(cachedData?.key).toBe('key1');
    expect(cachedData?.data).toBe(JSON.stringify({ name: 'test' }));
  });

  it('should return null when the Cache instance is not found', () => {
    const cachedData = cacheStore.get('nonexistentKey');
    expect(cachedData).toBeNull();
  });

  it('should clear the cache correctly', () => {
    const cache1 = new Cache('key1', { name: 'test1' });
    const cache2 = new Cache('key2', { name: 'test2' });

    cacheStore.set(cache1);
    cacheStore.set(cache2);

    expect(cacheStore.get('key1')).toBeDefined();
    expect(cacheStore.get('key2')).toBeDefined();

    cacheStore.clear();

    expect(cacheStore.get('key1')).toBeNull();
    expect(cacheStore.get('key2')).toBeNull();
  });
});
