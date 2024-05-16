import { config } from '../config/config.service';

export const RedisConfigService = {
  host: config.redisHost,
  port: config.redisPort,
};
