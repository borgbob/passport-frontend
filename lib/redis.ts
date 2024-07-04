import Redis, {RedisOptions} from 'ioredis';
import {redisConf} from '@/lib/config';

function getRedisConfiguration(): {
  host?: string,
  port?: string,
  password?: string
} {
  return redisConf;
}

export function getRedisInstance(
  config = getRedisConfiguration()
) {
  try {
    const options: RedisOptions = {
      host: config.host,
      lazyConnect: true,
      showFriendlyErrorStack: true,
      enableAutoPipelining: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) {
          throw new Error(`[Redis] Could not connect after ${times} attempts`);
        }
        return Math.min(times * 200, 1000);
      },
    };

    if (config.port) {
      options.port = Number(config.port);
    }

    if (config.password) {
      options.password = config.password;
    }
	const redis = new Redis(options);

    redis.on('error', (error: unknown) => {
      console.warn(`[Redis] error connecting`, error);
    });
    return redis;

  } catch (e) {
    throw new Error(`[Redis] could not create new instance`);
  }

}
