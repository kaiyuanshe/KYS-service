import { parse } from 'path';
import { BodyParam, JsonController, Post } from 'routing-controllers';
import { loadPage, fetchAsset } from 'web-fetch';

import { uploadToAzureBlob } from '../utility';

@JsonController('/crawler')
export class CrawlerController {
    @Post('/task/page')
    async createPageTask(@BodyParam('source') source: string) {
        const scope = parse(source).name,
            folder = 'article';
        const baseURI = `https://ows.blob.core.chinacloudapi.cn/$web/${folder}`,
            {
                window: { document }
            } = await loadPage(source);

        for await (const { MIME, name, data } of fetchAsset(document, {
            scope,
            baseURI
        })) {
            await uploadToAzureBlob(data, `${folder}/${name}`, MIME);

            console.log(`[upload] ${baseURI}${name}`);
        }
        return {
            targetURL: new URL(`${scope}.html`, baseURI) + ''
        };
    }
}
