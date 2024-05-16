export enum ENV {
  PRODUCTION = 'production',
  DEVELOPMENT = 'development',
  TEST = 'test',
}

export enum LOG_TYPE {
  API = 'api',
  SCHEDULER = 'scheduler',
  UNKNOWN = 'unknown',
}

export const LOG_FILE_PATH = './logs/';
