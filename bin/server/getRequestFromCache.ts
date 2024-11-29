import { Context, Next } from 'hono';
import { cacheStore } from '../cache';
import { getKey } from '../utils/getKey';
import { ICache } from '../types';
import chalk from 'chalk';

export const getRequestFromCache = async (c: Context, next: Next) => {
  const key = getKey(c);

  const setCacheHeader = (status: 'HIT' | 'MISS') => {
    c.res.headers.set('X-Cache', status);
  };

  try {
    const cachedResponse = cacheStore.get(key) as ICache;
    if (cachedResponse) {
      setCacheHeader('HIT');
      console.log(chalk.green.bold(`HIT: `) + `${key}`);
      return c.json(JSON.parse(cachedResponse.data));
    }

    setCacheHeader('MISS');
    console.log(chalk.yellow.bold(`MISS: `) + `${key}`);
    await next();
  } catch (e) {
    console.error(chalk.red(e));
    setCacheHeader('MISS');
    await next();
  }
};
