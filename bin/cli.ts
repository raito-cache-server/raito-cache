import { program } from 'commander';
import { CliOptions } from './types';
import { client } from './client';
import chalk from 'chalk';
import { app } from './server';
import * as bcrypt from 'bcrypt';

program
  .name('raito-cache')
  .description('Lite caching proxy server')
  .requiredOption('--port <port>', 'define port on which to start the server')
  .option(
    '--host <host>',
    'define host on which to start the server',
    'localhost',
  )
  .option('--origin <url>', 'define url for caching')
  .option(
    '--ttl <ms>',
    'define time to live for the cache record in ms',
    parseInt,
  )
  .option(
    '-pass, --password <password>',
    'define a password for the server to prevent non authorized connections',
    (value: string) => {
      const salt = bcrypt.genSaltSync();
      return bcrypt.hashSync(value, salt);
    },
  )
  .version('1.0.0', '-v, --version')
  .parse(process.argv);

export const options: CliOptions = program.opts<CliOptions>();

(async () => {
  try {
    await app.bootstrap(options);
    console.log(
      `Ratio-Cache Server started. Type ${chalk.bold("'help'")} for commands`,
    );
    client.handleCommand();
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
})();
