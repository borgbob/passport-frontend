import { Redis } from "@upstash/redis";
import { redisConf } from "@/lib/config";


export function getRedisInstance(config = redisConf) {
  try {
    return Redis.fromEnv();
  } catch (e) {
    console.error(e)
    throw new Error(`[Redis] could not create new instance`);
  }
}
