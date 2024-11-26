import { ICache } from '../types';

export class Cache implements ICache {
  public readonly key: string;
  public readonly data: string;

  constructor(key: string, data: any) {
    this.key = key;
    this.data = JSON.stringify(data);
  }
}
