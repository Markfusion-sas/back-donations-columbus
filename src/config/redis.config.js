import { REDIS_HOST, REDIS_PORT, REDIS_URL } from '#config/environment.config';

export const redisConnection = REDIS_URL
  ? { url: REDIS_URL }
  : { host: REDIS_HOST, port: Number(REDIS_PORT) };
