import { TableCellLink, TableRecordFields } from 'mobx-lark';
import { parse } from 'path';
import {
    JsonController,
    Post,
    Params,
    Body,
    Authorized,
    QueryParams
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
    LarkBaseTableRecord,
    LarkBaseTableRecordFileModel,
    LarkBaseTable,
    LarkBaseTableModel,
    PageSelector
} from '../model';

const OWSBlobHost = blobEndPointOf(AZURE_BLOB_CONNECTION);

@JsonController('/crawler')
export class CrawlerController {
    @Post('/task/page')
    @Authorized()
    @ResponseSchema(PageTaskModel)
    async createPageTask(
        @Body() { source, rootSelector }: PageTask
    ): Promise<PageTaskModel> {
        console.log('createPageTask', source, rootSelector);

        const { scope, baseURI } = await this.savePage({
            source,
            rootSelector
        });

        return {
            target: new URL(`${scope}.html`, baseURI) + ''
        };
    }

    async *saveFiles(fields: TableRecordFields) {
        for (const value of Object.values(fields))
            if (value instanceof Array)
                for (const item of value)
                    if (typeof item === 'object' && 'file_token' in item) {
                        const file = Buffer.from(
                                await lark.downloadFile(item.file_token)
                            ),
                            path = `file/${item.name}`;
                        const URI = `${OWSBlobHost}/$web/${path}`;

                        await uploadToAzureBlob(file, path, item.type);

                        console.log(`[upload] ${URI}`);

                        yield URI;
                    }
    }

    async savePage({ source, rootSelector }: PageTask) {
        const scope = parse(source).name,
            folder = 'article';
        const baseURI = `${OWSBlobHost}/$web/${folder}/`,
            {
                window: { document }
            } = await loadPage(source);

        for (const element of document.querySelectorAll<HTMLElement>(
            '[style*="visibility"]'
        ))
            element.style.visibility = 'visible';

        for await (const { MIME, name, data } of fetchAsset(document, {
            scope,
            rootSelector,
            baseURI
        })) {
            await uploadToAzureBlob(data, `${folder}/${name}`, MIME);

            console.log(`[upload] ${baseURI}${name}`);
        }

        return { scope, baseURI };
    }

    @Post('/task/lark/base/:base/:table/:record/file')
    @Authorized()
    @ResponseSchema(LarkBaseTableRecordFileModel)
    async createLarkBaseTableRecordFileTask(
        @Params()
        { base: bid, table: tid, record: rid }: LarkBaseTableRecord
    ): Promise<LarkBaseTableRecordFileModel> {
        await lark.getAccessToken();

        const table = new CommonBiDataTable(bid, tid);

        const fields = await table.getOne(rid),
            files = [
                ...(await AsyncIterator.from(this.saveFiles(fields)).toArray())
            ];
        return { files };
    }

    @Post('/task/lark/base/:base/:table/page')
    @Authorized()
    @ResponseSchema(LarkBaseTableModel, { isArray: true })
    async createLarkBaseTablePageTask(
        @Params() { base: bid, table: tid }: LarkBaseTable,
        @QueryParams() { rootSelector = '#page-content' }: PageSelector
    ): Promise<LarkBaseTableModel[]> {
        await lark.getAccessToken();

        const table = new CommonBiDataTable(bid, tid);

        const records = await table.getAll(),
            list: LarkBaseTableModel[] = [];

        for (const fields of records) {
            list.push({
                id: fields['id'] as string
            });

            await this.savePage({
                source: (fields['link'] as TableCellLink).link,
                rootSelector
            });
        }

        return list;
    }

    @Post('/task/lark/base/:base/:table/file')
    @Authorized()
    @ResponseSchema(LarkBaseTableRecordFileModel, { isArray: true })
    async createLarkBaseTableFileTask(
        @Params()
        { base: bid, table: tid }: LarkBaseTable
    ): Promise<LarkBaseTableRecordFileModel[]> {
        await lark.getAccessToken();

        const table = new CommonBiDataTable(bid, tid);

        const records = await table.getAll(),
            list: LarkBaseTableRecordFileModel[] = [];

        for (const fields of records) {
            const files = [
                ...(await AsyncIterator.from(this.saveFiles(fields)).toArray())
            ];
            list.push({ id: fields['id'] as string, files });
        }
        return list;
    }
}
