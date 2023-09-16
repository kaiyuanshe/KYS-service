import { fromBuffer } from 'file-type';
import { BlobServiceClient } from '@azure/storage-blob';
import { BiDataTable, LarkApp, TableRecordFields } from 'mobx-lark';

export const {
    NODE_ENV,
    PORT = 8080,
    DATABASE_URL,
    AZURE_BLOB_CONNECTION,
    WEB_HOOK_TOKEN,
    AUTHING_APP_SECRET,
    LARK_APP_ID,
    LARK_APP_SECRET
} = process.env;

export const isProduct = NODE_ENV === 'production';

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
