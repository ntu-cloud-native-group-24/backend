import { FastifyInstance } from 'fastify'
import {
	success,
	fail,
	wrapSuccessOrNotSchema,
	UploadRequestRef,
	UploadRequestType,
	UploadResponseRef,
	UploadResponseType
} from '../schema'
import { imageUploadsContainer, generateSasUrl, getPublicURL } from '../azure/blob'
import { randomUUID } from 'crypto'

const IMAGE_MIME_TO_EXTENSION = {
	'image/png': 'png',
	'image/jpeg': 'jpeg'
} as const

export default async function init(app: FastifyInstance) {
	app.post<{
		Body: UploadRequestType
	}>(
		'/images',
		{
			schema: {
				body: UploadRequestRef,
				description: 'Get an image upload URL and public URL',
				tags: ['images'],
				summary: 'Get an image upload URL and public URL from azure blob storage',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							upload: UploadResponseRef
						})
					}
				}
			}
		},
		async (req, reply) => {
			const { type, prefix } = req.body
			const suffix = IMAGE_MIME_TO_EXTENSION[type]
			const blobName = (prefix ? `${prefix}-${randomUUID()}` : randomUUID()) + `.${suffix}`
			const sas = await generateSasUrl(imageUploadsContainer, blobName)
			req.log.info(`Successfully uploaded image ${sas}`)
			reply.send(success({ upload: { sas, url: getPublicURL(imageUploadsContainer, blobName) } }))
		}
	)
}
