import { parse } from 'path';
import { JsonController, Post, Params, BodyParam } from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { loadPage, fetchAsset } from 'web-fetch';

import {
    AZURE_BLOB_CONNECTION,
    blobEndPointOf,
    uploadToAzureBlob,
    lark
} from '../utility';
import {
    PageTaskModel,
    LarkBaseTableRecordData,
    LarkBaseTableRecordFileTask,
    LarkBaseTableRecordFileModel
} from '../model/Crawler';

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

    @Post('/task/lark/base/:base/:table/:record/file')
    @ResponseSchema(LarkBaseTableRecordFileModel)
    async createLarkBaseTableRecordFileTask(
        @Params()
        { base: bid, table: tid, record: rid }: LarkBaseTableRecordFileTask
    ): Promise<LarkBaseTableRecordFileModel> {
        const base = await lark.getBITable(bid);
        const table = await base.getTable(tid);

        const { body } = await lark.client.get<LarkBaseTableRecordData>(
                `${table.baseURI}/records/${rid}`
            ),
            files = [];

        for (const value of Object.values(body.data.record.fields))
            if (value instanceof Array)
                for (const item of value)
                    if (typeof item === 'object' && 'file_token' in item) {
                        const file = Buffer.from(
                                await lark.downloadFile(item.file_token)
                            ),
                            path = `file/${item.name}`;

                        await uploadToAzureBlob(file, path, item.type);

                        files.push(`${OWSBlobHost}/$web/${path}`);
                    }
        return { files };
    }
}
