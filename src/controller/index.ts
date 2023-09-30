import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { isProduct } from '../utility';
import { CheckEventController } from './CheckEvent';
import { CrawlerController } from './Crawler';
import { SessionController } from './Session';
import { UserController } from './User';

export const { router, swagger, mocker } = createAPI({
    mock: !isProduct,
    controllers: [
        SessionController,
        UserController,
        CheckEventController,
        CrawlerController
    ]
});
