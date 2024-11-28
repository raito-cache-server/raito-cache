import { Context } from 'hono';

export const getKey = (c: Context) => {
  return `${c.req.method}:${c.req.path}`;
};
