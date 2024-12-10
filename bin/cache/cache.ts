import { ICache } from '../types';

export class Cache implements ICache {
  public readonly key: string;
  public readonly data: string;
  public readonly createdAt: Date;
  private cachettl?: number;

  constructor(key: string, data: any, ttl?: number) {
    this.key = key;
    this.data = JSON.stringify(data);
    this.createdAt = new Date();
    this.cachettl = ttl;
  }

  public setTtl(value?: number) {
    this.cachettl = value;
  }

  public get ttl() {
    return this.cachettl;
  }
}
