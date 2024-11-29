import * as readline from 'node:readline';
import { completer } from './completer';
import { commands } from './commands';
import chalk from 'chalk';

export class Client {
  private readonly rl: readline.Interface;

  constructor() {
    this.rl = this.createReadline();
  }

  public handleCommand() {
    this.rl.on('line', async (line) => {
      const lineParts = line.split(' ');
      const command = lineParts[0].trim();
      if (commands[command]) {
        try {
          await commands[command].handler(lineParts[1], lineParts[2]);
        } catch (e) {
          console.error(chalk.red.bold(`ERROR: `) + `${(e as Error).message}`);
        }
      } else {
        console.log(
          `Unknown command. Type ${chalk.bold("'help'")} for commands`,
        );
      }
      this.rl.prompt();
    });

    this.rl.on('close', () => {
      console.log(chalk.yellow(`Ratio-Cache Server terminated`));
      process.exit(0);
    });

    this.rl.on('error', (error) => {
      console.error(chalk.red.bold(`ERROR: `) + error.message);
    });

    this.rl.prompt();
  }

  private createReadline() {
    return readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '> ',
      completer,
    });
  }
}

export const client = new Client();
