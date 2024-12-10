export interface ICache {
  key: string;
  data: string;
  createdAt: Date;
  ttl: number | undefined;
  setTtl(value?: number): void;
}
