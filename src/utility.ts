import { BlobServiceClient } from '@azure/storage-blob';
import { fromBuffer } from 'file-type';
import { HTTPClient, HTTPError } from 'koajax';
import {
    BiDataQueryOptions,
    BiDataTable,
    LarkApp,
    TableCellValue,
    TableRecordFields
} from 'mobx-lark';
import { HttpError } from 'routing-controllers';
import { FindOptionsWhere, ILike } from 'typeorm';

import { Base } from './model';

export const {
    NODE_ENV,
    PORT = 8080,
    DATABASE_URL,
    AZURE_BLOB_CONNECTION,
    WEB_HOOK_TOKEN,
    APP_SECRET,
    LEANCLOUD_API_HOST,
    LEANCLOUD_APP_ID,
    LEANCLOUD_APP_KEY,
    LARK_APP_ID,
    LARK_APP_SECRET,
    HR_BASE_ID,
    PERSON_TABLE_ID,
    INFURA_API_KEY,
    SEPOLIA_PVK,
    SEPOLIA_CONTRACT_ADDRESS
} = process.env;

export const isProduct = NODE_ENV === 'production';

export const searchConditionOf = <T extends Base>(
    keys: (keyof T)[],
    keywords = '',
    filter?: FindOptionsWhere<T>
) =>
    keywords
        ? keys.map(key => ({ [key]: ILike(`%${keywords}%`), ...filter }))
        : filter;

export const leanClient = new HTTPClient({
    baseURI: `https://${LEANCLOUD_API_HOST}/1.1/`,
    responseType: 'json'
}).use(async ({ request }, next) => {
    request.headers = {
        ...request.headers,
        'X-LC-Id': LEANCLOUD_APP_ID,
        'X-LC-Key': LEANCLOUD_APP_KEY
    };
    try {
        await next();
    } catch (error) {
        const { response } = error as HTTPError<{
            code: number;
            error: string;
        }>;
        const { status, body } = response;

        throw new HttpError(status, body.error);
    }
});

export const lark = new LarkApp({
    id: LARK_APP_ID,
    secret: LARK_APP_SECRET
});

export class CommonBiDataTable extends BiDataTable<TableRecordFields>() {
    client = lark.client;
}

export interface Person
    extends Record<'name' | 'gender' | 'email' | '手机号', string> {
    avatar: TableCellValue;
}

export class PersonBiDataTable extends BiDataTable<Person>() {
    client = lark.client;
    queryOptions: BiDataQueryOptions = { text_field_as_array: false };

    constructor(appId = HR_BASE_ID, tableId = PERSON_TABLE_ID) {
        super(appId, tableId);
    }
}

export const blobURLOf = (value: TableCellValue) =>
    value instanceof Array
        ? typeof value[0] === 'object' &&
          ('file_token' in value[0] || 'attachmentToken' in value[0])
            ? `${OWSBlobRoot}/${value[0].name}`
            : ''
        : value + '';

export const parseBlobConnection = (raw: string) =>
    Object.fromEntries(
        raw.split(';').map(item => {
            const [key, ...value] = item.split('=');

            return [key, value.join('=')];
        })
    ) as Record<
        | 'DefaultEndpointsProtocol'
        | 'AccountName'
        | 'AccountKey'
        | 'EndpointSuffix',
        string
    >;

export function blobEndPointOf(connection: string) {
    const { DefaultEndpointsProtocol, AccountName, EndpointSuffix } =
        parseBlobConnection(connection);

    return `${DefaultEndpointsProtocol}://${AccountName}.blob.${EndpointSuffix}`;
}

export const OWSBlobHost = blobEndPointOf(AZURE_BLOB_CONNECTION);
export const OWSBlobContainer = '$web';
export const OWSBlobRoot = `${OWSBlobHost}/${OWSBlobContainer}`;

export async function uploadToAzureBlob(
    data: Buffer,
    fileName: string,
    fileType = 'application/octet-stream',
    containerName = OWSBlobContainer
) {
    const client = BlobServiceClient.fromConnectionString(
        AZURE_BLOB_CONNECTION
    );
    const container = client.getContainerClient(containerName);
    const file = container.getBlockBlobClient(fileName);

    const { mime } = (await fromBuffer(data)) || {};

    return file.upload(data, data.byteLength, {
        blobHTTPHeaders: { blobContentType: mime || fileType }
    });
}
