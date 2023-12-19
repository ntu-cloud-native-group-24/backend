import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilegeAndReturnUID, createDummyStore } from '../utils/testutils'
import { createMeal } from './meals'
import {
	createOrder,
	getOrderWithDetails,
	checkedGetOrderWithDetails,
	getOrdersByUser,
	getOrdersByStore,
	updateOrderStateOrThrow,
	getCompletedOrdersByStoreAndTime
} from './orders'
import { getSelectionGroupsWithData } from './customizations'
import { UICustomizationsType } from '../schema/customizations'

let store: Awaited<ReturnType<typeof createDummyStore>>
let user_id: Awaited<ReturnType<typeof createUserOfPrivilegeAndReturnUID>>
let meal: Awaited<ReturnType<typeof createMeal>>

let store2: Awaited<ReturnType<typeof createDummyStore>>
let user_id2: Awaited<ReturnType<typeof createUserOfPrivilegeAndReturnUID>>
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
	meal = await createMeal({ ...mealData, store_id: store.id })
	store2 = await createDummyStore()
	user_id2 = await createUserOfPrivilegeAndReturnUID('consumer')
	meal_store2 = await createMeal({ ...mealData, store_id: store2.id })
})

test('create order', async () => {
	const order_id = await createOrder(user_id, store.id, {
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
	})
	expect(order_id).toEqual(expect.any(Number))
	const order = (await getOrderWithDetails(order_id))!
	expect(order).toMatchObject({
		id: order_id,
		user_id,
		store_id: store.id,
		notes: '',
		payment_type: 'cash',
		delivery_method: 'pickup',
		state: 'pending',
		calculated_total_price: 260,
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
	})
	orderObj = order
})
test('create order with unavailable meal', async () => {
	const meal = await createMeal({ ...mealData, store_id: store.id, is_available: false })
	expect(
		createOrder(user_id, store.id, {
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
		})
	).rejects.toThrow()
})
test('create order with invalid quantity', async () => {
	await expect(
		createOrder(user_id, store.id, {
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
		})
	).rejects.toThrow()
})
test('create order with invalid meal id', async () => {
	await expect(
		createOrder(user_id, store.id, {
			notes: '',
			payment_type: 'cash',
			delivery_method: 'pickup',
			items: [
				{
					meal_id: -1,
					quantity: 2,
					notes: '不要酸菜',
					customization_statuses: [false, true]
				}
			]
		})
	).rejects.toThrow()
})
test('create order with meal from another store', async () => {
	await expect(
		createOrder(user_id, store.id, {
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
		})
	).rejects.toThrow()
})
test('create order with empty order', async () => {
	await expect(
		createOrder(user_id, store.id, {
			notes: '',
			payment_type: 'cash',
			delivery_method: 'pickup',
			items: []
		})
	).rejects.toThrow()
})
test('get non existent order', async () => {
	expect(await getOrderWithDetails(-1)).toBeUndefined()
})
test('checked get order for original user', async () => {
	expect(await checkedGetOrderWithDetails(user_id, orderObj!.id)).toEqual(orderObj)
})
test('checked get order for store owner', async () => {
	expect(await checkedGetOrderWithDetails(store.owner_id, orderObj!.id)).toEqual(orderObj)
})
test('checked get order for other user', async () => {
	expect(await checkedGetOrderWithDetails(user_id2, orderObj!.id)).toBeUndefined()
})
test('checked get order for another store owner', async () => {
	expect(await checkedGetOrderWithDetails(store2.owner_id, orderObj!.id)).toBeUndefined()
})
test('get orders by user', async () => {
	const tmp = { ...orderObj }
	delete tmp.details
	expect(await getOrdersByUser(user_id)).toEqual([tmp])
})
test('get orders by store', async () => {
	const tmp = { ...orderObj }
	delete tmp.details
	expect(await getOrdersByStore(store.id)).toEqual([tmp])
})
test("user can't update order state to preparing", async () => {
	await expect(updateOrderStateOrThrow(user_id, orderObj!.id, 'preparing')).rejects.toThrow()
})
test("update order state can't go to invalid state", async () => {
	await expect(updateOrderStateOrThrow(store.owner_id, orderObj!.id, 'completed')).rejects.toThrow()
})
test('update order state: pending -> prepairing', async () => {
	await updateOrderStateOrThrow(store.owner_id, orderObj!.id, 'preparing')
	expect((await getOrderWithDetails(orderObj!.id))!.state).toBe('preparing')
})
test('update order state: prepairing -> prepared', async () => {
	await updateOrderStateOrThrow(store.owner_id, orderObj!.id, 'prepared')
	expect((await getOrderWithDetails(orderObj!.id))!.state).toBe('prepared')
})
test('update order state: prepared -> completed', async () => {
	await updateOrderStateOrThrow(user_id, orderObj!.id, 'completed')
	expect((await getOrderWithDetails(orderObj!.id))!.state).toBe('completed')
})
test('get orders by store and time', async () => {
	let tmp = { ...orderObj }
	delete tmp.details
	tmp.state = 'completed'
	const time = tmp.created_at
	const now = new Date()
	const month_begin = new Date(time?.getFullYear() || now.getFullYear(), time?.getMonth() || now.getMonth())
	const month_end = new Date(month_begin.getFullYear(), Number(month_begin.getMonth()) + 1)
	expect(await getCompletedOrdersByStoreAndTime(store.id, month_begin, month_end)).toContainEqual(tmp)
})
