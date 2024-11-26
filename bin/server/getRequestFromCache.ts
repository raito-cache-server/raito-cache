import { Context, Next } from 'hono';
import { cacheStore } from '../cache/cacheStore';

export const getRequestFromCache = async (c: Context, next: Next) => {
  const key = c.req.path;

  const setCacheHeader = (status: 'HIT' | 'MISS') => {
    c.res.headers.set('X-Cache', status);
  };

  try {
    const cachedResponse = cacheStore.get(key);
    if (cachedResponse) {
      setCacheHeader('HIT');
      console.log(`HIT: ${key}`);
      return c.json(JSON.parse(cachedResponse.data));
    }

    setCacheHeader('MISS');
    console.log(`MISS: ${key}`);
    await next();
  } catch (e) {
    console.error(e);
    setCacheHeader('MISS');
    await next();
  }
};
