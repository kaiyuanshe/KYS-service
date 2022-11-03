import { fromBuffer } from 'file-type';
import { HttpRequestBody, BlobServiceClient } from '@azure/storage-blob';

const { AZURE_BLOB_CONNECTION } = process.env;

export async function uploadToAzureBlob(
    data: Exclude<
        HttpRequestBody,
        ArrayBufferView | (() => NodeJS.ReadableStream)
    >,
    fileName: string,
    fileType = 'application/octet-stream',
    containerName = '$web'
) {
    const client = BlobServiceClient.fromConnectionString(
        AZURE_BLOB_CONNECTION
    );
    const container = client.getContainerClient(containerName);
    const file = container.getBlockBlobClient(fileName),
        buffer =
            typeof data === 'string'
                ? Buffer.from(data)
                : data instanceof Blob
                ? Buffer.from(await data.arrayBuffer())
                : data instanceof ArrayBuffer && Buffer.from(data);

    const { mime } = (await fromBuffer(buffer)) || {};

    return file.upload(buffer, buffer.byteLength, {
        blobHTTPHeaders: { blobContentType: mime || fileType }
    });
}
