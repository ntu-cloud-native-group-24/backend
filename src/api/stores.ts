import { FastifyInstance } from 'fastify'
import {
	success,
	fail,
	wrapSuccessOrNotSchema,
	StoreTypeRef,
	StoreType,
	StoreWithoutIdTypeRef,
	StoreWithoutIdType,
	PartialStoreWithoutIdTypeRef,
	PartialStoreWithoutIdType,
	StoreOpeningHoursRef,
	StoreOpeningHoursType,
	StoreOpeningHoursWithoutIdRef,
	StoreOpeningHoursWithoutIdType,
	StoreCategoryRef
} from '../schema'
import { loginRequired } from './auth'
import {
	getAllStores,
	getStoreById,
	createStore,
	modifySrore,
	addOpeningHours,
	getOpeningHoursByStoreId,
	deleteOpeningHours
} from '../models/store'
import {
	createStoreCategory,
	getStoreCategoriesByStore,
	getStoreCategoryByStoreAndId
} from '../models/store_categories'

export default async function init(app: FastifyInstance) {
	app.get(
		'/store',
		{
			schema: {
				description: 'Get all stores',
				tags: ['store'],
				summary: 'Get all stores',
				response: {
					200: wrapSuccessOrNotSchema({
						stores: { type: 'array', items: StoreTypeRef }
					})
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			reply.send(
				success({
					stores: await getAllStores()
				})
			)
		}
	)
	app.get<{
		Params: { id: number }
	}>(
		'/store/:id',
		{
			schema: {
				description: 'Get store by id',
				tags: ['store'],
				summary: 'Get store by id',
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				response: {
					200: wrapSuccessOrNotSchema({
						store: StoreTypeRef
					}),
					404: wrapSuccessOrNotSchema({})
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail())
			}
			reply.send(success({ store }))
		}
	)
	app.post<{
		Body: StoreWithoutIdType
	}>(
		'/store',
		{
			preHandler: loginRequired,
			schema: {
				body: StoreWithoutIdTypeRef,
				description: 'Create a new store',
				tags: ['store'],
				summary: 'Create a new store',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							store: StoreTypeRef
						})
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { name, description, address, picture_url, status, phone, email } = req.body
			const store = await createStore({
				owner_id: req.user.id,
				name,
				description,
				address,
				picture_url,
				status,
				phone,
				email
			})
			if (store) {
				reply.send(success({ store }))
			} else {
				reply.code(400).send(fail('Unable to create store'))
			}
		}
	)
	app.put<{
		Params: { id: number }
		Body: StoreWithoutIdType
	}>(
		'/store/:id',
		{
			preHandler: loginRequired,
			schema: {
				body: StoreWithoutIdTypeRef,
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Modify store by id',
				tags: ['store'],
				summary: 'Modify store by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							store: StoreTypeRef
						})
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					404: {
						description: 'Not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (store.owner_id !== req.user.id) {
				return reply.code(400).send(fail('You are not the owner of this store'))
			}
			const { name, description, address, picture_url, status, phone, email } = req.body
			const newStore = await modifySrore(req.user.id, {
				id,
				name,
				description,
				address,
				picture_url,
				status,
				phone,
				email
			})
			if (newStore) {
				reply.send(success({ store: newStore }))
			} else {
				reply.code(400).send(fail('Unable to modify store'))
			}
		}
	)
	app.patch<{
		Params: { id: number }
		Body: PartialStoreWithoutIdType
	}>(
		'/store/:id',
		{
			preHandler: loginRequired,
			schema: {
				body: PartialStoreWithoutIdTypeRef,
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Modify store by id',
				tags: ['store'],
				summary: 'Modify store by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							store: StoreTypeRef
						})
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					404: {
						description: 'Not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (store.owner_id !== req.user.id) {
				return reply.code(400).send(fail('You are not the owner of this store'))
			}
			const { name, description, address, picture_url, status, phone, email } = req.body
			const newStore = await modifySrore(req.user.id, {
				id,
				name,
				description,
				address,
				picture_url,
				status,
				phone,
				email
			})
			if (newStore) {
				reply.send(success({ store: newStore }))
			} else {
				reply.code(400).send(fail('Unable to modify store'))
			}
		}
	)
	app.get<{
		Params: { id: number }
	}>(
		'/store/:id/hours',
		{
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Get store opening hours by id',
				tags: ['store'],
				summary: 'Get store opening hours by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							hours: { type: 'array', items: StoreOpeningHoursRef }
						})
					},
					404: {
						description: 'Not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			reply.send(success({ hours: await getOpeningHoursByStoreId(id) }))
		}
	)
	app.post<{
		Params: { id: number }
		Body: StoreOpeningHoursWithoutIdType
	}>(
		'/store/:id/hours',
		{
			preHandler: loginRequired,
			schema: {
				body: StoreOpeningHoursWithoutIdRef,
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Add store opening hours by id',
				tags: ['store'],
				summary: 'Add store opening hours by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							hours: StoreOpeningHoursRef
						})
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					404: {
						description: 'Not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (store.owner_id !== req.user.id) {
				return reply.code(400).send(fail('You are not the owner of this store'))
			}
			const { day, open_time, close_time } = req.body
			const hours = await addOpeningHours(id, {
				day,
				open_time,
				close_time
			})
			if (hours) {
				reply.send(success({ hours }))
			} else {
				reply.code(400).send(fail('Unable to add opening hours'))
			}
		}
	)
	app.delete<{
		Params: { id: number; hour_id: number }
	}>(
		'/store/:id/hours/:hour_id',
		{
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						hour_id: { type: 'number' }
					}
				},
				description: 'Delete store opening hours by id',
				tags: ['store'],
				summary: 'Delete store opening hours by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					404: {
						description: 'Not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { id, hour_id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (store.owner_id !== req.user.id) {
				return reply.code(400).send(fail('You are not the owner of this store'))
			}
			const hours = await deleteOpeningHours(hour_id)
			if (hours) {
				reply.send(success({}))
			} else {
				reply.code(400).send(fail('Unable to delete opening hours'))
			}
		}
	)
	app.get<{
		Params: { store_id: number }
	}>(
		'/store/:store_id/category',
		{
			schema: {
				description: 'Get categories by store id',
				tags: ['store'],
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
