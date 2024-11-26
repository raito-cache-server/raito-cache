import { Context } from 'hono';
import { cacheStore, Cache } from '../cache';

export const cacheResponse = async (c: Context, body: any) => {
  const key = c.req.path;
  cacheStore.set(new Cache(key, body));
};
