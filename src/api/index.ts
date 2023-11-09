import { FastifyInstance } from 'fastify'
import initHealth from './health'
import initStore from './stores'
import initAuth from './auth'

export default async function init(app: FastifyInstance) {
	initHealth(app)
	initStore(app)
	initAuth(app)
}
