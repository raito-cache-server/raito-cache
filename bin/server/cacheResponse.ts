import { Context } from 'hono';
import { cacheStore } from '../cache/cacheStore';
import { Cache } from '../cache/cache';

export const cacheResponse = async (c: Context, body: any) => {
  const key = c.req.routePath;
  cacheStore.set(new Cache(key, body));
};
