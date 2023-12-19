export const blobServiceClient = 1
export const imageUploadsContainer = 2

export async function generateSasUrl(containerClient: any, blobName: string) {
	return `https://example.com/${blobName}`
}

export function getPublicURL(containerClient: any, blobName: string) {
	return `https://example.com/${blobName}`
}
