import { fromBuffer } from 'file-type';
import { BlobServiceClient } from '@azure/storage-blob';

export const { AZURE_BLOB_CONNECTION } = process.env;

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
