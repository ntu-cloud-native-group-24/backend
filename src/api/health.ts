import { FastifyInstance } from 'fastify'

export default async function init(app: FastifyInstance) {
	app.get(
		'/health/check',
		{
			schema: {
				description: 'Health Check',
				tags: ['misc'],
				summary: 'Check the health of the API',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: {
							status: { type: 'string' }
						}
					}
				}
			}
		},
		(req, reply) => {
			reply.send({ status: 'ok' })
		}
	)
}
