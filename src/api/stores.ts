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
	PartialStoreWithoutIdType
} from '../schema'
import { loginRequired } from './auth'
import { getAllStores, getStoreById, createStore, modifySrore } from '../models/store'

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
			const { name, description, address, picture_url } = req.body
			const store = await createStore({
				owner_id: req.user.id,
				name,
				description,
				address,
				picture_url
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
			const { name, description, address, picture_url } = req.body
			const newStore = await modifySrore(req.user.id, {
				id,
				name,
				description,
				address,
				picture_url
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
			const { name, description, address, picture_url } = req.body
			const newStore = await modifySrore(req.user.id, {
				id,
				name,
				description,
				address,
				picture_url
			})
			if (newStore) {
				reply.send(success({ store: newStore }))
			} else {
				reply.code(400).send(fail('Unable to modify store'))
			}
		}
	)
}
