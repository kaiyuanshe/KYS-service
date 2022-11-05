import { createAPI } from 'koagger';
import { CrawlerController } from './Crawler';

export const { router, swagger } = createAPI({
    controllers: [CrawlerController]
});
