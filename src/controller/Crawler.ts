import { parse } from 'path';
import { BodyParam, JsonController, Post } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { loadPage, fetchAsset } from 'web-fetch';

import {
    AZURE_BLOB_CONNECTION,
    blobEndPointOf,
    uploadToAzureBlob
} from '../utility';
import { PageTaskModel } from '../model/Crawler';

const OWSBlobHost = blobEndPointOf(AZURE_BLOB_CONNECTION);

@JsonController('/crawler')
export class CrawlerController {
    @Post('/task/page')
    @ResponseSchema(PageTaskModel)
    async createPageTask(
        @BodyParam('source', { required: true }) source: string
    ): Promise<PageTaskModel> {
        const scope = parse(source).name,
            folder = 'article';
        const baseURI = `${OWSBlobHost}/$web/${folder}/`,
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
            target: new URL(`${scope}.html`, baseURI) + ''
        };
    }
}
