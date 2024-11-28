import { options } from '../cli';
import { Cache, cacheStore } from '../cache';
import { server } from '../server';
import { ICache } from '../types';

export type CommandData = {
  description: string;
  handler: (...args: string[]) => Promise<void> | void;
};

export const commands: Record<string, CommandData> = {
  status: {
    description: 'Check server status',
    handler: async () => {
      console.log(
        `Server:\t${server.getStatus() ? 'running' : 'stopped'}\nHost:\t${options.host}:${options.port}\nCache:\t${(cacheStore.get('*') as Map<string, ICache>).size} records`,
      );
    },
  },
  stop: {
    description: 'Stop the server',
    handler: async () => {
      server.stopServer();
      console.log(`Stopping server...`);
    },
  },
  start: {
    description: 'Start the server',
    handler: async () => {
      await server.listen(options);
      console.log(`Starting server...`);
    },
  },
  exit: {
    description: 'Stop the server and terminate the process',
    handler: () => {
      server.stopServer();
      console.log('Server stopped. Exiting process...');
      process.exit(0);
    },
  },
  'clear-cache': {
    description: 'Delete all cached data',
    handler: () => {
      cacheStore.clear();
      console.log('Cleared');
    },
  },
  get: {
    description: 'Get cache by different options. Args: <key> - cache key',
    handler: (key: string) => {
      if (!key) {
        return console.error(`ERROR: Missing required arguments`);
      }

      const entries = cacheStore.get(key);

      if (entries instanceof Map) {
        const maxKeyLength = Math.max(
          ...Array.from(entries.keys(), (k) => k.length),
        );
        entries.forEach((entry) => {
          console.log(
            `[${entry.key}]`.padEnd(maxKeyLength) + `\t${entry.data}`,
          );
        });
      } else if (entries instanceof Cache) {
        console.log(`[${entries?.key}]\t${entries?.data}`);
      }
    },
  },
  set: {
    description:
      'Define a new cache record. Args: <key> - cache key, * - get all, <data> - cache data',
    handler: (key: string, data: string) => {
      if (!key || !data) {
        return console.error(`ERROR: Missing required arguments`);
      }
      cacheStore.set(new Cache(key, data));
      console.log('Saved');
    },
  },
  help: {
    description: 'Get help for a specific or all commands',
    handler: () => {
      console.log('\nAvailable Commands:');
      for (const [cmd, { description }] of Object.entries(commands)) {
        console.log(`  ${cmd.padEnd(15)}\t${description}`);
      }
    },
  },
};
