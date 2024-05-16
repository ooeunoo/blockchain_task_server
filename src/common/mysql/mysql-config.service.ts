import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { config } from '../config/config.service';
import { ConstraintSnakeNamingStrategy } from './mysql-naming.strategy';

/*  ISSUE

1) 토큰 이름, 심볼에 이모지가 들어가는 케이스가 존재 => error ex) Incorrect string value: '\\xF0\\x9F\\x90\\xB8' for column 'name' at row 1

mysql>  alter table token modify name varchar(255) charset utf8mb4 not null;
mysql>  alter table token modify symbol varchar(255) charset utf8mb4 not null;

*/

const mysqlConfig: TypeOrmModuleOptions = {
  type: 'mysql' as any,
  host: config.mysqlHost,
  port: config.mysqlPort,
  username: config.mysqlUsername,
  password: config.mysqlPassword,
  database: config.mysqlDatabase,
  synchronize: config.mysqlSynchronize,
  logging: config.mysqlLogging,
  dropSchema: config.mysqlDropSchema,
  autoLoadEntities: true,
  entities: ['dist/libs/repository/**/entity{.ts,.js}'],
  // entities: ['dist/**/*.entity{.ts,.js}'],
  // entities: [path.join(__dirname, '../../**/*.entity{.ts,.js}')],
  extra: {
    connectionLimit: config.mysqlPoolSize,
  },
  charset: 'utf8mb4',
  namingStrategy: new ConstraintSnakeNamingStrategy(),
};

@Injectable()
export class MysqlConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return { ...mysqlConfig };
  }
}

export default mysqlConfig;
