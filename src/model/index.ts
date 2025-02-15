import { ConnectionOptions, parse } from 'pg-connection-string';
import { DataSource } from 'typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';

import { DATABASE_URL, isProduct } from '../utility';
import {
    ActivityAgendaCheckInSummary,
    ActivityCheckInSummary,
    CheckEvent,
    UserActivityCheckInSummary
} from './CheckEvent';
import { User } from './User';
import { ActivityLog, UserRank } from './ActivityLog';
import { ElectionPublicKey, Voter } from './Election';

export * from './Base';
export * from './CheckEvent';
export * from './KToken';
export * from './User';
export * from './ActivityLog';
export * from './Election';

const { ssl, host, port, user, password, database } = isProduct
    ? parse(DATABASE_URL)
    : ({} as ConnectionOptions);

const commonOptions: Pick<
    SqliteConnectionOptions,
    'logging' | 'synchronize' | 'entities' | 'migrations'
> = {
    logging: true,
    synchronize: true,
    entities: [
        User,
        UserRank,
        ActivityLog,
        CheckEvent,
        UserActivityCheckInSummary,
        ActivityAgendaCheckInSummary,
        ActivityCheckInSummary,
        ElectionPublicKey,
        Voter
    ],
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
          ...commonOptions
      })
    : new DataSource({
          type: 'sqlite',
          database: '.tmp/test.db',
          ...commonOptions
      });
