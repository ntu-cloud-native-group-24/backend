/* istanbul ignore file */
import { FastifyInstance } from 'fastify'
import { randString } from '../utils'
import { redis } from '../redis'
import { createUser, getUserIdByUsername, REDIS_TOKEN_PREFIX, REDIS_TOKEN_EXPIRY } from '../models/user'
import { createStore } from '../models/store'
import { createStoreCategory } from '../models/store_categories'
import { OrderStateType, PrivilegeType, UICustomizationsType } from '../schema'
import { createMeal } from '../models/meals'
import { createOrder } from '../models/orders'
import { db } from '../db'

export async function createUserOfPrivilegeAndReturnToken(app: FastifyInstance, privilege: string) {
	const username = randString(8)
	const password = randString(12)
	await app.inject({
		method: 'POST',
		url: '/api/register',
		query: {
			privilege: privilege
		},
		payload: {
			name: 'test',
			email: 'user@example.com',
			username,
			password
		}
	})
	const response = await app.inject({
		method: 'POST',
		url: '/api/login',
		payload: {
			username,
			password
		}
	})
	return response.json().token
}

export async function createUserOfPrivilegeAndReturnUID(privilege: PrivilegeType) {
	const username = randString(8)
	const password = randString(12)
	await createUser({
		name: 'test',
		email: 'user@example.com',
		username,
		password,
		privilege
	})
	return getUserIdByUsername(username) as Promise<number>
}

export async function getTokenByUserId(id: number) {
	const token = crypto.getRandomValues(Buffer.alloc(16)).toString('hex')
	await redis.setex(REDIS_TOKEN_PREFIX + token, REDIS_TOKEN_EXPIRY, id.toString())
	return token
}

export async function createDummyStore() {
	const store_manager = await createUserOfPrivilegeAndReturnUID('store_manager')
	const store = await createStore({
		owner_id: store_manager,
		name: 'test',
		description: 'test',
		address: 'test',
		picture_url: 'test',
		status: false,
		phone: '35353535',
		email: 'peko@gmail.com'
	})
	return store!
}

export async function createDummyAndCategory() {
	const store = await createDummyStore()
	const category = await createStoreCategory({
		name: 'noodles',
		store_id: store.id
	})
	return { store, category }
}

export async function createDummyMeal(store_id: number) {
	const mealData = {
		name: '牛肉麵',
		description: '好吃的牛肉麵',
		price: 120,
		picture: 'https://example.com/beef-noodle.jpg',
		is_available: true,
		customizations: {
			selectionGroups: [
				{
					type: 'radio',
					title: '麵條',
					items: [
						{
							name: '細麵',
							price: 0,
							enabled: true
						},
						{
							name: '粗麵',
							price: 10,
							enabled: true
						}
					]
				}
			]
		} as UICustomizationsType
	}
	return createMeal({ ...mealData, store_id })
}
export async function createDummyOrder(user_id: number, store_id: number, meal_id: number, quantity: number = 2) {
	// meal_id must be dummy meal
	return createOrder(user_id, store_id, {
		notes: '',
		payment_type: 'cash',
		delivery_method: 'pickup',
		items: [
			{
				meal_id,
				quantity,
				notes: '不要酸菜',
				customization_statuses: [false, true]
			}
		]
	})
}

export async function setOrderState(order_id: number, state: OrderStateType) {
	// db.transaction()
	// 	.setIsolationLevel('read committed')
	// 	.execute(async tx => {
	// 		await tx.updateTable('orders').set({ state }).where('id', '=', order_id).execute()
	// 	})
	await db.updateTable('orders').set({ state }).where('id', '=', order_id).execute()
}
