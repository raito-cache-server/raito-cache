import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { CliOptions } from './types';

export const listen = async (options: CliOptions) => {
  const app = new Hono();
  const port = options.port;

  app.get('*', (c) => {
    return c.json('Hello Hono!');
  });

  serve({
    fetch: app.fetch,
    port,
  });
  console.log(`Caching proxy is running on http://localhost:${port}`);
};
