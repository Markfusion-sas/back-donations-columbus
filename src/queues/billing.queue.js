import { Queue } from 'bullmq';

import { redisConnection } from '#config/redis.config';

export const billingQueue = new Queue('billing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: true,
    removeOnFail: false
  }
});
