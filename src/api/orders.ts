import { FastifyInstance } from 'fastify'
import { createOrder, checkedGetOrder, updateOrderStateOrThrow } from '../models/orders'
import {
	success,
	fail,
	wrapSuccessOrNotSchema,
	OrderRequestType,
	OrderRequestRef,
	OrderRef,
	OrderStateRef
} from '../schema'
import { loginRequired } from './auth'
import { storeManagerRequired } from './stores'
import { OrderState } from '../db/types'
import { sendOrderNotification } from '../azure/mail'

export default async function init(app: FastifyInstance) {
	app.post<{
		Body: {
			store_id: number
			order: OrderRequestType
		}
	}>(
		'/orders',
		{
			preHandler: loginRequired,
			schema: {
				description: 'Create an order',
				tags: ['order'],
				summary: 'Create an order',
				body: {
					type: 'object',
					properties: {
						store_id: { type: 'number' },
						order: OrderRequestRef
					}
				},
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							order_id: {
								type: 'number'
							}
						})
					},
					400: {
						description: 'Invalid request body',
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
			const user_id = req.user.id
			const { store_id, order } = req.body
			try {
				const order_id = await createOrder(user_id, store_id, order)
				sendOrderNotification(order_id)
					.then(res => {
						res.map(r => {
							req.log.info(`Notification mail successfully sent to ${r.email}`)
						})
					})
					.catch(e => {
						req.log.error(`Error sending notification email: ${e.message}`)
					})
				reply.send(success({ order_id }))
			} catch (e) {
				if (e instanceof Error) {
					return reply.code(400).send(fail(e.message))
				}
				throw e
			}
		}
	)
	app.get<{
		Params: { order_id: number }
	}>(
		'/orders/:order_id',
		{
			preHandler: loginRequired,
			schema: {
				description: 'Get an order',
				tags: ['order'],
				summary: 'Get an order',
				params: {
					type: 'object',
					properties: {
						order_id: { type: 'number' }
					}
				},
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							order: OrderRef
						})
					},
					404: {
						description: 'Order not found',
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
			const { order_id } = req.params
			const order = await checkedGetOrder(req.user.id, order_id)
			if (!order) {
				return reply.code(404).send(fail('Order not found'))
			}
			reply.send(success({ order }))
		}
	)
	app.patch<{
		Params: { order_id: number }
		Body: {
			state: OrderState
		}
	}>(
		'/orders/:order_id',
		{
			preHandler: storeManagerRequired,
			schema: {
				description: 'Update an order',
				tags: ['order'],
				summary: 'Update an order',
				params: {
					type: 'object',
					properties: {
						order_id: { type: 'number' }
					}
				},
				body: {
					type: 'object',
					properties: {
						state: OrderStateRef
					}
				},
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					404: {
						description: 'Order not found',
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
			const { order_id } = req.params
			const order = await checkedGetOrder(req.user.id, order_id)
			if (!order) {
				return reply.code(404).send(fail('Order not found'))
			}
			const { state } = req.body
			await updateOrderStateOrThrow(req.user.id, order_id, state)
			reply.send(success({}))
		}
	)
}
