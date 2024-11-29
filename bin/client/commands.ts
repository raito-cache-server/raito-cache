import { options } from '../cli';
import { Cache, cacheStore } from '../cache';
import { server } from '../server';
import { ICache } from '../types';
import chalk from 'chalk';

export type CommandData = {
  description: string;
  handler: (...args: string[]) => Promise<void> | void;
  help?: string;
};

export const commands: Record<string, CommandData> = {
  status: {
    description: 'Check server status',
    handler: async () => {
      console.log(
        `Server:` +
          `\t${server.getStatus() ? chalk.green('running') : chalk.red('stopped')}\n` +
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
    description: 'Stop the server',
    handler: async () => {
      server.stopServer();
      console.log(chalk.red(`Stopping server...`));
    },
  },
  start: {
    description: 'Start the server',
    handler: async () => {
      await server.listen(options);
      console.log(chalk.green(`Starting server...`));
    },
  },
  exit: {
    description: 'Stop the server and terminate the process',
    handler: () => {
      server.stopServer();
      console.log(chalk.red('Server stopped. Exiting process...'));
      process.exit(0);
    },
  },
  'clear-cache': {
    description: 'Delete all cached data',
    handler: (key?: string) => {
      cacheStore.clear(key);
      console.log(chalk.green('Cleared'));
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
          console.log(
            chalk.bold.grey(`[${entry.key}]`).padEnd(maxKeyLength) +
              `\t${entry.data}`,
          );
        });
      } else if (entries instanceof Cache) {
        console.log(
          chalk.bold.grey(`[${entries?.key}]`) + `\t${entries?.data}`,
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
  set: {
    description: `Define a new cache record. Args: ${chalk.bold('<key>')} - cache key (* - get all), ${chalk.bold('<data>')} - cache data`,
    handler: (key: string, data: string) => {
      if (!key || !data) {
        return console.error(
          chalk.red.bold(`ERROR: `) + `Missing required arguments`,
        );
      }
      cacheStore.set(new Cache(key, data));
      console.log(chalk.green('Saved'));
    },
    help:
      `set key data`.padEnd(35) +
      `create a new record with ${chalk.bold("'key'")} and ${chalk.bold("'data'")}`,
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
