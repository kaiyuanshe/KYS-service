import type {} from 'koa2-swagger-ui';
import { createAPI } from 'koagger';

import { CheckEventController } from './CheckEvent';
import { CrawlerController } from './Crawler';
import { SessionController } from './Session';

export const { router, swagger, mocker } = createAPI({
    mock: true,
    controllers: [SessionController, CheckEventController, CrawlerController]
});
