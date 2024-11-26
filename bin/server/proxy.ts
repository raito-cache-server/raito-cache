import { Context } from 'hono';
import { options } from '../cli';
import path from 'node:path';
import { cacheResponse } from './cacheResponse';

export const proxy = async (c: Context) => {
  try {
    const url = path.join(options.origin, c.req.routePath);
    const response = await fetch(url, {
      method: c.req.method,
      headers: new Headers(c.req.header()),
      body: c.req.raw.body,
    });
    const responseBody = await response.json();

    await cacheResponse(c, responseBody);
    return (c.res = response);
  } catch (e) {
    console.error(`ERROR: ${(e as Error).message}`);
    return (c.res = new Response('Internal Server Error', { status: 500 }));
  }
};
