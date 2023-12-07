import { FastifyInstance } from 'fastify'
import { success, fail, wrapSuccessOrNotSchema, StoreCategoryRef } from '../schema'
import { storeManagerRequired } from './stores'
import { getStoreById } from '../models/store'
import {
	createStoreCategory,
	getStoreCategoriesByStore,
	getStoreCategoryByStoreAndId
} from '../models/store_categories'

export default async function init(app: FastifyInstance) {
	app.get<{
		Params: { store_id: number }
	}>(
		'/store/:store_id/category',
		{
			schema: {
				description: 'Get categories by store id',
				tags: ['store', 'categories'],
				summary: 'Get all the id and name of categories',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							categories: {
								type: 'array',
								items: StoreCategoryRef
							}
						})
					}
				}
			}
		},
		async (req, reply) => {
			const { store_id } = req.params
			const store = await getStoreById(store_id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			reply.send(success({ categories: await getStoreCategoriesByStore(store_id) }))
		}
	)
	app.post<{
		Params: { store_id: number }
		Body: {
			name: string
		}
	}>(
		'/store/:store_id/category',
		{
			preHandler: storeManagerRequired,
			schema: {
				description: 'Create category by store id',
				tags: ['store', 'categories'],
				summary: 'Create a new category',
				body: {
					type: 'object',
					required: ['name'],
					properties: {
						name: { type: 'string' }
					}
				},
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							category: StoreCategoryRef
						})
					}
				}
			}
		},
		async (req, reply) => {
			const { store_id } = req.params
			const store = await getStoreById(store_id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			const { name } = req.body
			const category = await createStoreCategory({ store_id, name })
			reply.send(success({ category }))
		}
	)
	app.get<{
		Params: {
			store_id: number
			category_id: number
		}
	}>(
		'/store/:store_id/category/:category_id',
		{
			schema: {
				description: 'Get category by store id and category id',
				tags: ['store'],
				summary: 'Get the id and name of category',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							category: StoreCategoryRef
						})
					}
				}
			}
		},
		async (req, reply) => {
			const { store_id, category_id } = req.params
			const store = await getStoreById(store_id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			const category = await getStoreCategoryByStoreAndId(store_id, category_id)
			if (!category) {
				return reply.code(404).send(fail('ID not found'))
			}
			reply.send(success({ category: category }))
		}
	)
}
