import { BlobServiceClient } from '@azure/storage-blob';
import { fromBuffer } from 'file-type';
import { HTTPClient } from 'koajax';
import { BiDataTable, LarkApp, TableRecordFields } from 'mobx-lark';
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
}).use(({ request }, next) => {
    request.headers = {
        ...request.headers,
        'X-LC-Id': LEANCLOUD_APP_ID,
        'X-LC-Key': LEANCLOUD_APP_KEY
    };
    return next();
});

export const lark = new LarkApp({
    id: LARK_APP_ID,
    secret: LARK_APP_SECRET
});

export class CommonBiDataTable extends BiDataTable<TableRecordFields>() {
    client = lark.client;
}

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

export async function uploadToAzureBlob(
    data: Buffer,
    fileName: string,
    fileType = 'application/octet-stream',
    containerName = '$web'
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
