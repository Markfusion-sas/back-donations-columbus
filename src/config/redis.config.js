import { REDIS_HOST, REDIS_PORT, REDIS_URL } from '#config/environment.config';

const parseRedisUrl = (url) => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port),
    password: parsed.password || undefined,
    username: parsed.username !== 'default' ? parsed.username : undefined,
  };
};

export const redisConnection = REDIS_URL
  ? parseRedisUrl(REDIS_URL)
  : { host: REDIS_HOST, port: Number(REDIS_PORT) };
