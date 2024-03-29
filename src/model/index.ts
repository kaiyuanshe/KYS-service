import { ConnectionOptions, parse } from 'pg-connection-string';
import { DataSource } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { DATABASE_URL, isProduct } from '../utility';
import { CheckEvent } from './CheckEvent';
import { User } from './User';

export * from './Base';
export * from './CheckEvent';
export * from './Crawler';
export * from './KToken';
export * from './User';

const { ssl, host, port, user, password, database } = isProduct
    ? parse(DATABASE_URL)
    : ({} as ConnectionOptions);

const commonOptions: Pick<
    SqliteConnectionOptions,
    'synchronize' | 'entities' | 'migrations'
> = {
    synchronize: true,
    entities: [User, CheckEvent],
    migrations: [`${isProduct ? '.tmp' : 'migration'}/*.ts`]
};

export const dataSource = isProduct
    ? new DataSource({
          type: 'postgres',
          ssl: ssl as boolean,
          host,
          port: +port,
          username: user,
          password,
          database,
          logging: true,
          ...commonOptions
      })
    : new DataSource({
          type: 'sqlite',
          database: '.tmp/test.db',
          logging: false,
          ...commonOptions
      });
