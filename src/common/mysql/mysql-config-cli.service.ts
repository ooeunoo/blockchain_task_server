import mysqlConfig from './mysql-config.service';

const cliConfig = {
  ...mysqlConfig,
  migrations: ['database/migrations/**/*.ts'],
  cli: {
    migrationsDir: 'database/migrations',
    subscribersDir: 'database/subscriber',
  },
  seeds: ['database/seeds/**/*{.ts,.js}'],
};
export default cliConfig;
