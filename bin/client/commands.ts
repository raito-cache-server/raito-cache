import { options } from '../cli';
import { Cache, cacheStore } from '../cache';
import { ICache } from '../types';
import chalk from 'chalk';
import { app } from '../server';

export type CommandData = {
  description: string;
  handler: (...args: string[]) => Promise<void> | void;
  help?: string;
};

export const commands: Record<string, CommandData> = {
  status: {
    description: 'Check server status',
    handler: async () => {
      const status = app.getServersStatus();
      const wsState = chalk[status ? 'green' : 'red']('websocket');

      console.log(
        `Server:` +
          `\t${options.password ? chalk.green('ꄗ') : ''}${wsState}\n` +
          `Host:` +
          chalk.blueBright(`\thttp://${options.host}:${options.port}\n`) +
          `Cache:` +
          chalk.yellow(
            `\t${(cacheStore.get('*') as Map<string, ICache>).size} records`,
          ),
      );
    },
  },
  stop: {
    description: `Stop the server.`,
    handler: async () => {
      app.stopServer();
      console.log(chalk.red(`Stopping server...`));
    },
  },
  start: {
    description: `Start the server. Args: ${chalk.bold('<server>')} - server name: ws/http (optional)`,
    handler: async () => {
      await app.startServer();
      console.log(chalk.green(`Starting server...`));
    },
  },
  exit: {
    description: 'Stop the server and terminate the process',
    handler: () => {
      app.stopServer();
      console.log(chalk.yellow('App stopped. Exiting process...'));
      process.exit(0);
    },
  },
  'clear-cache': {
    description: 'Delete all cached data',
    handler: (key?: string) => {
      cacheStore.clear(key);
    },
  },
  get: {
    description: `Get cache by different options. Args: ${chalk.bold('<key>')} - cache key`,
    handler: (key: string) => {
      if (!key) {
        return console.error(
          chalk.bold.red(`ERROR: `) + `Missing required arguments`,
        );
      }

      const entries = cacheStore.get(key);

      if (entries instanceof Map) {
        const maxKeyLength = Math.max(
          ...Array.from(entries.keys(), (k) => k.length),
        );
        entries.forEach((entry) => {
          const ttl = entry.ttl ?? options.ttl;
          const ttlStr = ttl ? ` ${ttl}` : '';
          console.log(
            chalk.bold.grey(`[${entry.key}${ttlStr}]`).padEnd(maxKeyLength) +
              `\t${entry.data}`,
          );
        });
      } else if (entries instanceof Cache) {
        const ttl = entries.ttl ?? options.ttl;
        const ttlStr = ttl ? ` ${ttl}` : '';
        console.log(
          chalk.bold.grey(`[${entries?.key}${ttlStr}]`) + `\t${entries?.data}`,
        );
      }
    },
    help:
      `get`.padEnd(35) +
      `get cache\n` +
      `get *`.padEnd(35) +
      `get all records\n` +
      `get key`.padEnd(35) +
      `get cache by ${chalk.bold(`key`)}\n` +
      `get HTTP_METHOD`.padEnd(35) +
      `get all cached responses from ${chalk.bold(`HTTP_METHOD`)} requests. Example: get POST\n` +
      `get :ROUTE`.padEnd(35) +
      `get all cached responses from the specific ${chalk.bold(`route`)}. Example: get :tasks/2\n` +
      `get HTTP_METHOD:ROUTE`.padEnd(35) +
      `get a specific cached response`,
  },
  ttl: {
    description: `Define new ttl value the next records. Args: ${chalk.bold('<ms>')} - time to live in ms`,
    handler: (key: string) => {
      cacheStore.ttl(Number(key));
    },
  },
  set: {
    description: `Define a new cache record. Args: ${chalk.bold('<key>')} - cache key, ${chalk.bold('<data>')} - cache data, ${chalk.bold('<ttl>')} - cache ttl (optional)`,
    handler: (key: string, data: string, ttl?: string) => {
      if (!key || !data) {
        return console.error(
          chalk.red.bold(`ERROR: `) + `Missing required arguments`,
        );
      }
      const cacheTtl = Number(ttl);
      cacheStore.set(new Cache(key, data, cacheTtl));
      console.log(chalk.green('Saved'));
    },
    help:
      `set key data ttl`.padEnd(25) +
      `create a new record with ${chalk.bold("'key'")}, ${chalk.bold("'data'")} and ${chalk.bold("'ttl'")}`,
  },
  help: {
    description: 'Get help for a specific or all commands',
    handler: (command?: string) => {
      if (command) {
        const help = commands[command]?.help;
        if (help) {
          return console.log(help);
        }
      }
      console.log('Available Commands:');
      for (const [cmd, { description }] of Object.entries(commands)) {
        console.log(`${cmd.padEnd(15)}\t${description}`);
      }
    },
  },
};
