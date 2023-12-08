import { FastifyInstance } from 'fastify'
import {
	success,
	fail,
	wrapSuccessOrNotSchema,
	StoreOpeningHoursRef,
	StoreOpeningHoursWithoutIdRef,
	StoreOpeningHoursWithoutIdType
} from '../schema'
import { storeManagerRequired } from './stores'
import { getStoreById } from '../models/store'
import { addOpeningHours, getOpeningHoursByStoreId, deleteOpeningHours } from '../models/hours'

export default async function init(app: FastifyInstance) {
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
				tags: ['store', 'hours'],
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
				}
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
			preHandler: storeManagerRequired,
			schema: {
				body: StoreOpeningHoursWithoutIdRef,
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Add store opening hours by id',
				tags: ['store', 'hours'],
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
			preHandler: storeManagerRequired,
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						hour_id: { type: 'number' }
					}
				},
				description: 'Delete store opening hours by id',
				tags: ['store', 'hours'],
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
}
