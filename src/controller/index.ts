import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { CheckEventController } from './CheckEvent';
import { CrawlerController } from './Crawler';
import { KTokenController } from './KToken';
import { UserController } from './User';
import { ActivityLogController } from './ActivityLog';
import { BaseController } from './Base';

export * from './Base';
export * from './User';
export * from './ActivityLog';

export const controllers = [
    UserController,
    CheckEventController,
    CrawlerController,
    KTokenController,
    ActivityLogController,
    BaseController
];
export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers
});
