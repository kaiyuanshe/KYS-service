import { createAPI } from 'koagger';

import { CrawlerController } from './Crawler';
import { SessionController } from './Session';

export const { router, swagger, mocker } = createAPI({
    mock: true,
    controllers: [CrawlerController, SessionController]
});
