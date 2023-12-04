import { FastifyInstance } from 'fastify'
import initHealth from './health'
import initStore from './stores'
import initAuth, { initAuthMiddleware } from './auth'
import initMeal from './meals'

export default async function init(app: FastifyInstance) {
	initAuthMiddleware(app)
	initHealth(app)
	initStore(app)
	initAuth(app)
	initMeal(app)
}
