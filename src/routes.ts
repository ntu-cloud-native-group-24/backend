import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import initApi from './api'

export async function initRoutes(app: FastifyInstance) {
	app.register(initApi, { prefix: '/api' })
}
