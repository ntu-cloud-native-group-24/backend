import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export default async function init(app: FastifyInstance) {
	app.get(
		'/stores',
		{
			schema: {
				description: 'Get all stores',
				tags: ['stores'],
				summary: 'Get all stores',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: {
							success: { type: 'boolean' },
							stores: {
								type: 'array',
								items: {
									$ref: 'Store'
								}
							}
						}
					}
				}
			}
		},
		(req: FastifyRequest, reply: FastifyReply) => {
			reply.send({
				success: true,
				stores: [
					{
						id: '01234567-89ab-cdef-0123-456789abcdef',
						displayName: 'Test Store',
						storePicture: 'https://via.placeholder.com/150'
					}
				]
			})
		}
	)
}
