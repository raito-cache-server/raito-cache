import { Context } from 'hono';
import { options } from '../cli';
import path from 'node:path';
import { cacheResponse } from './cacheResponse';

const createRequestBody = async (c: Context): Promise<string | undefined> => {
  if (c.req.method === 'GET') return undefined;
  try {
    return JSON.stringify(await c.req.json());
  } catch (error) {
    console.error('Failed to parse request body:', error);
    throw new Error('Invalid request body');
  }
};

const forwardRequest = async (url: string, method: string, body?: string) => {
  const headers = { 'Content-Type': 'application/json' };
  return fetch(url, { method, headers, body });
};

const handleError = (c: Context, error: unknown): Response => {
  console.error('Proxy error:', error);
  c.status(500);
  return c.body('Internal Server Error');
};

export const proxy = async (c: Context) => {
  const url = path.join(options.origin, c.req.path);

  try {
    const body = await createRequestBody(c);
    const response = await forwardRequest(url, c.req.method, body);
    const responseBody = await response.json();

    await cacheResponse(c, responseBody);

    return c.json(responseBody, { status: response.status });
  } catch (error) {
    return handleError(c, error);
  }
};
