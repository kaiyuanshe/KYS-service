import { parse } from 'path';
import { promises } from 'fs';
import { BodyParam, JsonController, Post } from 'routing-controllers';
import { savePage } from 'web-fetch';

import { uploadToAzureBlob } from '../utility';

@JsonController('/crawler')
export class CrawlerController {
    @Post('/task/page')
    async createPageTask(@BodyParam('source') source: string) {
        const { name } = parse(source),
            baseURI = 'https://ows.blob.core.chinacloudapi.cn/$web/article/';

        await savePage({ source, baseURI, rootFolder: '.tmp' });

        await uploadToAzureBlob(
            await promises.readFile(`.tmp/${name}.html`, { encoding: 'utf-8' }),
            `article/${name}.html`,
            'text/html'
        );
        return {
            targetURL: new URL(`${name}.html`, baseURI) + ''
        };
    }
}
