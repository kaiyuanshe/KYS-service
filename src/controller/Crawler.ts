import { parse } from 'path';
import { BodyParam, JsonController, Post } from 'routing-controllers';
import { savePage } from 'web-fetch';

@JsonController('/crawler')
export class CrawlerController {
    @Post('/task/page')
    async createPageTask(@BodyParam('source') source: string) {
        const { name } = parse(source),
            baseURI = 'https://ows.blob.core.chinacloudapi.cn/$web/article/';

        await savePage({ source, baseURI, rootFolder: '.tmp' });

        return {
            targetURL: new URL(`${name}.html`, baseURI) + ''
        };
    }
}
