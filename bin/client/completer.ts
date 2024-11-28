import { commands } from './commands';

export const completer = (line: string) => {
  const hits = Object.keys(commands).filter((cmd) => cmd.startsWith(line));
  return [hits.length ? hits : Object.keys(commands), line];
};
