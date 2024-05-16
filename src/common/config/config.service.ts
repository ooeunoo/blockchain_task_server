import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import * as fs from 'fs';
import { ENV } from './config.constant';

export type EnvConfig = Record<string, any>;

export class ConfigService {
  private readonly envConfig: EnvConfig;

  constructor(filePath: string) {
    const config = dotenv.parse(fs.readFileSync(filePath));
    this.envConfig = this.validateInput(config);
  }

  private validateInput(envConfig: EnvConfig): EnvConfig {
    const envValues = Object.keys(ENV).map((k) => ENV[k]);

    const envVarsSchema: Joi.ObjectSchema = Joi.object({
      ENV: Joi.string()
        .valid(...envValues)
        .default(ENV.DEVELOPMENT),

      PROJECT_NAME: Joi.string().required(),

      // swagger
      SWAGGER_TITLE: Joi.string().required(),
      SWAGGER_DESCRIPTION: Joi.string().required(),
      SWAGGER_VERSION: Joi.string().required(),
      SWAGGER_TAG: Joi.string().required(),

      // mysql
      MYSQL_HOST: Joi.string().required(),
      MYSQL_PORT: Joi.number().required(),
      MYSQL_DATABASE: Joi.string().required(),
      MYSQL_USERNAME: Joi.string().required(),
      MYSQL_PASSWORD: Joi.string().required(),
      MYSQL_POOL_SIZE: Joi.number().required(),
      MYSQL_SYNCHRONIZE: Joi.boolean().required(),
      MYSQL_LOGGING: Joi.boolean().required(),
      MYSQL_DROP_SCHEMA: Joi.boolean().required(),
      MYSQL_MIGRATION: Joi.boolean().required(),

      // redis
      REDIS_HOST: Joi.string().required(),
      REDIS_PORT: Joi.number().required(),

      // ipfs
      IPFS_HOST: Joi.string().required(),

      OCTET_TOKEN: Joi.string().required(),
    });

    const { error, value: validatedEnvConfig } =
      envVarsSchema.validate(envConfig);
    if (error) {
      throw new Error(`Config validation error: ${error.message}`);
    }
    return validatedEnvConfig;
  }

  get environment(): ENV {
    return this.envConfig.ENV;
  }
  get projectName(): string {
    return this.envConfig.PROJECT_NAME;
  }
  get swaggerTitle(): string {
    return this.envConfig.SWAGGER_TITLE;
  }
  get swaggerDescription(): string {
    return this.envConfig.SWAGGER_DESCRIPTION;
  }
  get swaggerVersion(): string {
    return this.envConfig.SWAGGER_VERSION;
  }
  get swaggerTag(): string {
    return this.envConfig.SWAGGER_TAG;
  }
  get mysqlHost(): string {
    return this.envConfig.MYSQL_HOST;
  }
  get mysqlPort(): number {
    return parseInt(this.envConfig.MYSQL_PORT, 10);
  }
  get mysqlDatabase(): string {
    return this.envConfig.MYSQL_DATABASE;
  }
  get mysqlUsername(): string {
    return this.envConfig.MYSQL_USERNAME;
  }
  get mysqlPassword(): string {
    return this.envConfig.MYSQL_PASSWORD;
  }
  get mysqlPoolSize(): number {
    return this.envConfig.MYSQL_POOL_SIZE;
  }
  get mysqlSynchronize(): boolean {
    return this.envConfig.MYSQL_SYNCHRONIZE;
  }
  get mysqlLogging(): boolean {
    return this.envConfig.MYSQL_LOGGING;
  }
  get mysqlDropSchema(): boolean {
    return this.envConfig.MYSQL_DROP_SCHEMA;
  }
  get mysqlMigration(): string {
    return this.envConfig.MYSQL_MIGRATION;
  }
  get redisHost(): string {
    return this.envConfig.REDIS_HOST;
  }
  get redisPort(): number {
    return parseInt(this.envConfig.REDIS_PORT, 10);
  }
  get ipfsHost(): string {
    return this.envConfig.IPFS_HOST;
  }
  get octetToken(): number {
    return this.envConfig.OCTET_TOKEN;
  }
}

export const config = new ConfigService(
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env.dev',
);
