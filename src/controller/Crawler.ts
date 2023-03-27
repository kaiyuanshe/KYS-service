import { parse } from 'path';
import {
    JsonController,
    Post,
    Params,
    Body,
    Authorized
} from 'routing-controllers';
import { ResponseSchema } from 'routing-controllers-openapi';
import { loadPage, fetchAsset } from 'web-fetch';

import {
    AZURE_BLOB_CONNECTION,
    blobEndPointOf,
    uploadToAzureBlob,
    lark,
    CommonBiDataTable
} from '../utility';
import {
    PageTask,
    PageTaskModel,
    LarkBaseTableRecordFileTask,
    LarkBaseTableRecordFileModel
} from '../model/Crawler';

const OWSBlobHost = blobEndPointOf(AZURE_BLOB_CONNECTION);

@JsonController('/crawler')
export class CrawlerController {
    @Post('/task/page')
    @Authorized()
    @ResponseSchema(PageTaskModel)
    async createPageTask(
        @Body() { source, rootSelector }: PageTask
    ): Promise<PageTaskModel> {
        const scope = parse(source).name,
            folder = 'article';
        const baseURI = `${OWSBlobHost}/$web/${folder}/`,
            {
                window: { document }
            } = await loadPage(source);

        for await (const { MIME, name, data } of fetchAsset(document, {
            scope,
            rootSelector,
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
    @Authorized()
    @ResponseSchema(LarkBaseTableRecordFileModel)
    async createLarkBaseTableRecordFileTask(
        @Params()
        { base: bid, table: tid, record: rid }: LarkBaseTableRecordFileTask
    ): Promise<LarkBaseTableRecordFileModel> {
        await lark.getAccessToken();

        const table = new CommonBiDataTable(bid, tid);

        const fields = await table.getOne(rid),
            files = [];

        for (const value of Object.values(fields))
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
