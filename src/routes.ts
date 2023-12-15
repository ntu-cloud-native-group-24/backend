import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import initApi from './api'

export async function initRoutes(app: FastifyInstance) {
	app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
		reply.header('Access-Control-Allow-Origin', '*')
		reply.header('Access-Control-Allow-Headers', '*')
		reply.header('Access-Control-Allow-Methods', '*')
		if (request.method === 'OPTIONS') {
			reply.send()
		}
	})
	app.register(initApi, { prefix: '/api' })
}
