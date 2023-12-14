import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilegeAndReturnUID, createDummyStore, getTokenByUserId } from '../utils/testutils'
import { createMeal } from '../models/meals'
import { getOrderWithDetails } from '../models/orders'
import { getSelectionGroupsWithData } from '../models/customizations'
import { UICustomizationsType } from '../schema/customizations'

let store: Awaited<ReturnType<typeof createDummyStore>>
let user_id: Awaited<ReturnType<typeof createUserOfPrivilegeAndReturnUID>>
let user_token: string
let meal: Awaited<ReturnType<typeof createMeal>>

let store2: Awaited<ReturnType<typeof createDummyStore>>
let user_id2: Awaited<ReturnType<typeof createUserOfPrivilegeAndReturnUID>>
let user_token2: string
let meal_store2: Awaited<ReturnType<typeof createMeal>>

let orderObj: Awaited<ReturnType<typeof getOrderWithDetails>>

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

beforeAll(async () => {
	store = await createDummyStore()
	user_id = await createUserOfPrivilegeAndReturnUID('consumer')
	user_token = await getTokenByUserId(user_id)
	meal = await createMeal({ ...mealData, store_id: store.id })
	store2 = await createDummyStore()
	user_id2 = await createUserOfPrivilegeAndReturnUID('consumer')
	user_token2 = await getTokenByUserId(user_id2)
	meal_store2 = await createMeal({ ...mealData, store_id: store2.id })
})

test('create order', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/orders`,
		headers: {
			'X-API-KEY': user_token
		},
		payload: {
			store_id: store.id,
			order: {
				notes: '',
				payment_type: 'cash',
				delivery_method: 'pickup',
				items: [
					{
						meal_id: meal.id,
						quantity: 2,
						notes: '不要酸菜',
						customization_statuses: [false, true]
					}
				]
			}
		}
	})
	expect(response.statusCode).toBe(200)
	const { order_id } = response.json()
	expect(order_id).toEqual(expect.any(Number))
	const response2 = await app.inject({
		method: 'GET',
		url: `/api/orders/${order_id}`,
		headers: {
			'X-API-KEY': user_token
		}
	})
	expect(response2.json()).toMatchObject({
		success: true,
		order: {
			id: order_id,
			user_id,
			store_id: store.id,
			notes: '',
			payment_type: 'cash',
			delivery_method: 'pickup',
			state: 'pending',
			total_price: 260,
			details: [
				{
					id: expect.any(Number),
					order_id,
					meal_id: meal.id,
					quantity: 2,
					notes: '不要酸菜',
					calculated_price_per_item: 130, // 120 + 10
					customizations: {
						selectionGroups: getSelectionGroupsWithData(mealData.customizations as UICustomizationsType, [
							false,
							true
						])
					}
				}
			]
		}
	})
	orderObj = response2.json().order
})
test('create order with invalid quantity', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/orders`,
		headers: {
			'X-API-KEY': user_token
		},
		payload: {
			store_id: store.id,
			order: {
				notes: '',
				payment_type: 'cash',
				delivery_method: 'pickup',
				items: [
					{
						meal_id: meal.id,
						quantity: 0,
						notes: '不要酸菜',
						customization_statuses: [false, true]
					}
				]
			}
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({
		success: false
	})
})
test('create order with invalid meal id', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/orders`,
		headers: {
			'X-API-KEY': user_token
		},
		payload: {
			store_id: store.id,
			order: {
				notes: '',
				payment_type: 'cash',
				delivery_method: 'pickup',
				items: [
					{
						meal_id: 999,
						quantity: 2,
						notes: '不要酸菜',
						customization_statuses: [false, true]
					}
				]
			}
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({
		success: false
	})
})
test('create order with meal from another store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/orders`,
		headers: {
			'X-API-KEY': user_token
		},
		payload: {
			store_id: store.id,
			order: {
				notes: '',
				payment_type: 'cash',
				delivery_method: 'pickup',
				items: [
					{
						meal_id: meal_store2.id,
						quantity: 2,
						notes: '不要酸菜',
						customization_statuses: [false, true]
					}
				]
			}
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({
		success: false
	})
})
test('create order with empty order', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/orders`,
		headers: {
			'X-API-KEY': user_token
		},
		payload: {
			store_id: store.id,
			order: {
				notes: '',
				payment_type: 'cash',
				delivery_method: 'pickup',
				items: []
			}
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({
		success: false
	})
})
test('get non existent order', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/orders/999`,
		headers: {
			'X-API-KEY': user_token
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toMatchObject({
		success: false
	})
})
test('get order for original user', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/orders/${orderObj!.id}`,
		headers: {
			'X-API-KEY': user_token
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		order: orderObj
	})
})
test('get order for store owner', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/orders/${orderObj!.id}`,
		headers: {
			'X-API-KEY': user_token
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		order: orderObj
	})
})
test('get order for other user', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/orders/${orderObj!.id}`,
		headers: {
			'X-API-KEY': user_token2
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toMatchObject({
		success: false
	})
})
test('get order for another store owner', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/orders/${orderObj!.id}`,
		headers: {
			'X-API-KEY': user_token2
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toMatchObject({
		success: false
	})
})
test('get orders owned by user', async () => {
	const tmp = { ...orderObj }
	delete tmp.details
	delete tmp.total_price
	const response = await app.inject({
		method: 'GET',
		url: `/api/me/orders`,
		headers: {
			'X-API-KEY': user_token
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		orders: [tmp]
	})
})
test('update order state', async () => {
	const response = await app.inject({
		method: 'PATCH',
		url: `/api/orders/${orderObj!.id}`,
		headers: {
			'X-API-KEY': await getTokenByUserId(store.owner_id)
		},
		payload: {
			state: 'preparing'
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true
	})
	const response2 = await app.inject({
		method: 'GET',
		url: `/api/orders/${orderObj!.id}`,
		headers: {
			'X-API-KEY': user_token
		}
	})
	expect(response2.statusCode).toBe(200)
	expect(response2.json()).toMatchObject({
		success: true,
		order: {
			...orderObj,
			state: 'preparing'
		}
	})
})
