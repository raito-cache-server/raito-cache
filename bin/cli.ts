import { InvalidOptionArgumentError, program } from 'commander';
import { CliOptions } from './types';
import { listen } from './server';

program
  .name('raito-cache')
  .description('Lite caching proxy server')
  .option('--port <port>', 'define port on which to start the server')
  .option('--origin <url>', 'define url for caching')
  .version('0.0.1', '-v, --version')
  .parse(process.argv);

export const options: CliOptions = program.opts<CliOptions>();

const parseRequiredOption = (
  options: CliOptions,
  requiredKeys: Array<keyof CliOptions>,
) => {
  for (const key of requiredKeys) {
    if (!options[key]) {
      throw new InvalidOptionArgumentError(
        `ERROR: Missing required option --${key}`,
      );
    }
  }
};

(async () => {
  try {
    parseRequiredOption(options, ['port', 'origin']);
    await listen(options);
  } catch (e) {
    console.error((e as Error).message);
    process.exit(1);
  }
})();
