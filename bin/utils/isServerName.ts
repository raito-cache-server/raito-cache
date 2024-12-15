import { ServerName } from '../server';

export const isServerName = (name?: string): name is ServerName => {
  return (name && name === 'ws') || name === 'http';
};
