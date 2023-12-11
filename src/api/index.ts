import { FastifyInstance } from 'fastify'
import initHealth from './health'
import initStore from './stores'
import initHours from './hours'
import initAuth, { initAuthMiddleware } from './auth'
import initMeal from './meals'
import initTags from './tags'
import initStoreCategories from './store_categories'
import initOrders from './orders'
import initImages from './images'

export default async function init(app: FastifyInstance) {
	initAuthMiddleware(app)
	initHealth(app)
	initStore(app)
	initHours(app)
	initAuth(app)
	initMeal(app)
	initTags(app)
	initStoreCategories(app)
	initOrders(app)
	initImages(app)
}
