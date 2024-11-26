import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { CliOptions } from '../types';
import { getRequestFromCache } from './getRequestFromCache';
import { proxy } from './proxy';

export const listen = async (options: CliOptions) => {
  const app = new Hono();
  const port = options.port;

  app.use(getRequestFromCache);
  app.all('*', proxy);

  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`Caching Proxy Running`);
};
