import { FastifyInstance } from 'fastify'
import {
	createOrder,
	checkedGetOrderWithDetails,
	updateOrderStateOrThrow,
	getCompletedOrdersByStoreAndTime,
	getOrdersByStore,
	getOrdersByUser
} from '../models/orders'
import {
	success,
	fail,
	wrapSuccessOrNotSchema,
	OrderRequestType,
	OrderRequestRef,
	OrderWithDetailsRef,
	OrderStateRef,
	MonthlyOrderStatsRef,
	OrderRef,
	StoreRef
} from '../schema'
import { loginRequired } from './user'
import { storeManagerRequired } from './stores'
import { OrderState } from '../db/types'
import { sendOrderNotification } from '../azure/mail'
import { getAllStores, getStoreById } from '../models/store'

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
				req.log.info(`User ${user_id} successfully sent order ${order_id} to store ${store_id}`)
				reply.send(success({ order_id }))
			} catch (e) {
				if (e instanceof Error) {
					req.log.info(`Error creating order: ${e.message}`)
					return reply.code(400).send(fail(e.message))
				}
				req.log.info(`Error creating order: ${e}`)
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
							order: OrderWithDetailsRef
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
			const order = await checkedGetOrderWithDetails(req.user.id, order_id)
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
			preHandler: loginRequired,
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
			const order = await checkedGetOrderWithDetails(req.user.id, order_id)
			if (!order) {
				return reply.code(404).send(fail('Order not found'))
			}
			const { state } = req.body
			await updateOrderStateOrThrow(req.user.id, order_id, state)
			req.log.info(`User ${req.user.id} successfully updated order ${order_id}`)
			reply.send(success({}))
		}
	)
	app.get(
		'/me/orders',
		{
			preHandler: loginRequired,
			schema: {
				description: 'Get orders of current user',
				tags: ['auth', 'user', 'order'],
				summary: 'Get orders of current user',
				response: {
					200: wrapSuccessOrNotSchema({
						orders: {
							type: 'array',
							items: OrderRef
						}
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
			const orders = await getOrdersByUser(req.user.id)
			reply.send(
				success({
					orders
				})
			)
		}
	)
	app.get(
		'/me/stores',
		{
			preHandler: loginRequired,
			schema: {
				description: 'Get stores owned by current user',
				tags: ['auth', 'user', 'store'],
				summary: 'Get stores owned by current user',
				response: {
					200: wrapSuccessOrNotSchema({
						stores: {
							type: 'array',
							items: StoreRef
						}
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
			const stores = await getAllStores({ user_id: req.user.id })
			reply.send(
				success({
					stores
				})
			)
		}
	)
	app.get<{
		Params: { id: number }
	}>(
		'/store/:id/orders',
		{
			preHandler: storeManagerRequired,
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Get orders of a store',
				tags: ['store', 'order'],
				summary: 'Get orders of a store',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							orders: { type: 'array', items: OrderRef }
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
			const orders = await getOrdersByStore(id)
			reply.send(success({ orders }))
		}
	)
	app.get<{
		Params: { id: number }
	}>(
		'/store/:id/orders/monthly',
		{
			preHandler: storeManagerRequired,
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Get orders in the last 12 month group by monthly of a store',
				tags: ['store', 'order'],
				summary: 'Get monthly orders of a store',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							results: {
								type: 'array',
								items: MonthlyOrderStatsRef
							}
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
			let results = []
			const now = new Date()
			let month_begin = new Date(now.getFullYear(), now.getMonth())
			let month_end = new Date(now.getFullYear(), Number(now.getMonth()) + 1)
			const last_month_number = 12
			for (let i = 0; i < last_month_number; i++) {
				const tmp = await getCompletedOrdersByStoreAndTime(id, month_begin, month_end)
				results.push({
					month: `${month_begin.getFullYear()}-${Number(month_begin.getMonth()) + 1}`,
					orders: tmp
				})
				month_begin.setMonth(month_begin.getMonth() - 1)
				month_end.setMonth(month_end.getMonth() - 1)
			}
			reply.send(success({ results }))
		}
	)
}
