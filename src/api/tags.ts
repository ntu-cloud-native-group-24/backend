import { FastifyInstance } from 'fastify'
import { getAllTags } from '../models/tags'
import { success, fail, wrapSuccessOrNotSchema, StoreTagRef } from '../schema'

export default async function init(app: FastifyInstance) {
	app.get(
		'/tags',
		{
			schema: {
				description: 'Get store tagws',
				tags: ['tags'],
				summary: 'Get all the id and name of store tags',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							tags: {
								type: 'array',
								items: StoreTagRef
							}
						})
					}
				}
			}
		},
		async (req, reply) => {
			reply.send(success({ tags: await getAllTags() }))
		}
	)
}
