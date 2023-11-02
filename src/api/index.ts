import { FastifyInstance } from 'fastify'
import initHealth from './health'
import initStore from './stores'

export default async function init(app: FastifyInstance) {
	initHealth(app)
	initStore(app)
}
