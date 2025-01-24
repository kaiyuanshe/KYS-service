import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { ActivityLogController } from './ActivityLog';
import { BaseController } from './Base';
import { CheckEventController } from './CheckEvent';
import { ElectionController } from './Election';
import { KTokenController } from './KToken';
import { UserController } from './User';

export * from './ActivityLog';
export * from './Base';
export * from './User';

export const controllers = [
    UserController,
    ElectionController,
    CheckEventController,
    KTokenController,
    ActivityLogController,
    BaseController
];
export const { swagger, mocker, router } = createAPI({
    mock: !isProduct,
    controllers
});
