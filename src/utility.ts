import { fromBuffer } from 'file-type';
import { BlobServiceClient } from '@azure/storage-blob';

const { AZURE_BLOB_CONNECTION } = process.env;

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
