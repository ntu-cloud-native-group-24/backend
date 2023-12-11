import {
	BlobServiceClient,
	ContainerClient,
	StorageSharedKeyCredential,
	BlobSASPermissions,
	generateBlobSASQueryParameters,
	BlockBlobClient
} from '@azure/storage-blob'

if (!process.env.AZURE_BLOB_CONNECTION_STRING || !process.env.IMAGE_UPLOADS_CONTAINER_NAME) {
	throw new Error('AZURE_BLOB_CONNECTION_STRING and IMAGE_UPLOADS_CONTAINER_NAME must be set')
}
const { AZURE_BLOB_CONNECTION_STRING, IMAGE_UPLOADS_CONTAINER_NAME } = process.env

function credentialsFromConnectionString(connectionString: string) {
	const parsed = Object.fromEntries(
		connectionString.split(';').map(part => {
			const i = part.indexOf('=')
			return [part.slice(0, i), part.slice(i + 1)]
		})
	) as {
		DefaultEndpointsProtocol: string
		AccountName: string
		AccountKey: string
		EndpointSuffix: string
	}
	const sharedKeyCredential = new StorageSharedKeyCredential(parsed.AccountName, parsed.AccountKey)
	const url = `${parsed.DefaultEndpointsProtocol}://${parsed.AccountName}.blob.${parsed.EndpointSuffix}`
	return { sharedKeyCredential, url }
}

const { sharedKeyCredential, url } = credentialsFromConnectionString(AZURE_BLOB_CONNECTION_STRING)
export const blobServiceClient = new BlobServiceClient(url, sharedKeyCredential)
export const imageUploadsContainer = blobServiceClient.getContainerClient(IMAGE_UPLOADS_CONTAINER_NAME)

export async function generateSasUrl(containerClient: ContainerClient, blobName: string) {
	// Check if the container exists and create if it doesn't
	await containerClient.createIfNotExists()

	const permissions = new BlobSASPermissions()
	permissions.create = true
	permissions.write = true

	const sasOptions = {
		containerName: containerClient.containerName,
		blobName,
		permissions,
		startsOn: new Date(),
		expiresOn: new Date(+new Date() + 3600 * 1000) // 1 hour later
	}

	const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString()

	return `${containerClient.url}/${blobName}?${sasToken}`
}
export function getPublicURL(containerClient: ContainerClient, blobName: string) {
	return `${containerClient.url}/${blobName}`
}
/* istanbul ignore next */
if (require.main === module) {
	;(async () => {
		const sas = await generateSasUrl(imageUploadsContainer, 'test.jpg')
		console.log(sas)
		const fs = await import('fs')

		// this can be done in the browser too
		const client2 = new BlockBlobClient(sas)
		const file = fs.readFileSync('./yaemiko.png')
		await client2.uploadData(file, {
			blobHTTPHeaders: {
				blobContentType: 'image/png',
				blobCacheControl: 'public, max-age=86400'
			}
		})

		console.log(getPublicURL(imageUploadsContainer, 'test.jpg'))
		const u = new URL(sas)
		u.search = ''
		console.log(u.toString())
	})()
}
