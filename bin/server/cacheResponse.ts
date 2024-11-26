import { Context } from 'hono';
import { cacheStore, Cache } from '../cache';
import { getKey } from '../utils/getKey';

export const cacheResponse = async (c: Context, body: any) => {
  const key = getKey(c);
  cacheStore.set(new Cache(key, body));
};
