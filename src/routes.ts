import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import initApi from './api'

export async function initRoutes(app: FastifyInstance) {
	app.register(initApi, { prefix: '/api' })

	// reverse this for reference
	app.put(
		'/some-route/:id',
		{
			schema: {
				description: 'post some data',
				tags: ['user', 'code'],
				summary: 'qwerty',
				params: {
					type: 'object',
					properties: {
						id: {
							type: 'string',
							description: 'user id'
						}
					}
				},
				body: {
					type: 'object',
					properties: {
						hello: { type: 'string' },
						obj: {
							type: 'object',
							properties: {
								some: { type: 'string' }
							}
						}
					}
				},
				response: {
					201: {
						description: 'Successful response',
						type: 'object',
						properties: {
							hello: { type: 'string' }
						}
					},
					default: {
						description: 'Default response',
						type: 'object',
						properties: {
							foo: { type: 'string' }
						}
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		(req, reply) => {}
	)
}
