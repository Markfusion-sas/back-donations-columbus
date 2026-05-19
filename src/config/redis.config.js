import { REDIS_HOST, REDIS_PORT } from '#config/environment.config';

export const redisConnection = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT)
};
