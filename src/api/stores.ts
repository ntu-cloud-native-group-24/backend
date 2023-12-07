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
	StoreTagRef,
	StoreTagType
} from '../schema'
import { loginRequired } from './auth'
import { getAllStores, getStoreById, createStore, modifySrore } from '../models/store'
import { addOpeningHours, getOpeningHoursByStoreId, deleteOpeningHours } from '../models/hours'
import { addTagToStore, removeTagFromStore, getTagsOfStore } from '../models/tags'

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
			preHandler: loginRequired,
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
		Params: { id: number }
	}>(
		'/store/:id/tags',
		{
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Get store tags by id',
				tags: ['store'],
				summary: 'Get store tags by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							tags: { type: 'array', items: StoreTagRef }
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
			reply.send(success({ tags: await getTagsOfStore(id) }))
		}
	)
	app.post<{
		Params: { id: number }
		Body: { tag_id: number }
	}>(
		'/store/:id/tags',
		{
			preHandler: loginRequired,
			schema: {
				body: {
					type: 'object',
					properties: {
						tag_id: { type: 'number' }
					}
				},
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Add store tag by id',
				tags: ['store'],
				summary: 'Add store tag by id',
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
			const { id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (store.owner_id !== req.user.id) {
				return reply.code(400).send(fail('You are not the owner of this store'))
			}
			const { tag_id } = req.body
			const res = await addTagToStore(id, tag_id)
			if (res) {
				reply.send(success({}))
			} else {
				reply.code(400).send(fail('Unable to add tag to store'))
			}
		}
	)
	app.delete<{
		Params: { id: number; tag_id: number }
	}>(
		'/store/:id/tags/:tag_id',
		{
			preHandler: loginRequired,
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						tag_id: { type: 'number' }
					}
				},
				description: 'Remove store tag by id',
				tags: ['store'],
				summary: 'Remove store tag by id',
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
			const { id, tag_id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (store.owner_id !== req.user.id) {
				return reply.code(400).send(fail('You are not the owner of this store'))
			}
			const res = await removeTagFromStore(id, tag_id)
			if (res) {
				reply.send(success({}))
			} else {
				reply.code(400).send(fail('Unable to remove tag from store'))
			}
		}
	)
}
