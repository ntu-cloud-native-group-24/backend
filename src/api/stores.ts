import { FastifyInstance } from 'fastify'
import { wrapSuccessOrNotSchema, StoreTypeRef, StoreType, StoreWithoutIdTypeRef, StoreWithoutIdType } from '../schema'
import { loginRequired } from './auth'
import { getAllStores, getStoreById, createStore } from '../models/store'

export default async function init(app: FastifyInstance) {
	app.get(
		'/store',
		{
			preHandler: loginRequired,
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
			reply.send({
				success: true,
				stores: await getAllStores()
			})
		}
	)
	app.get<{
		Params: { id: number }
	}>(
		'/store/:id',
		{
			preHandler: loginRequired,
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
				return reply.code(404).send({ success: false })
			}
			reply.send({ success: true, store })
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
							id: { type: 'number' }
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
			const id = await createStore({
				user_id: req.user.id,
				name,
				description,
				address,
				picture_url
			})
			if (id) {
				reply.send({ success: true, id })
			} else {
				reply.code(400).send({ success: false, id })
			}
		}
	)
}
