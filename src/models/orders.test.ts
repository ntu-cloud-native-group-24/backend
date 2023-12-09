import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilegeAndReturnUID, createDummyStore } from '../utils/testutils'
import { createMeal } from './meals'
import { createOrder, getOrder } from './orders'
import { getSelectionGroupsWithData } from './customizations'
import { CustomizationsType } from '../schema/customizations'

let store: Awaited<ReturnType<typeof createDummyStore>>
let user_id: Awaited<ReturnType<typeof createUserOfPrivilegeAndReturnUID>>
let meal: Awaited<ReturnType<typeof createMeal>>
let meal_from_another_store: Awaited<ReturnType<typeof createMeal>>

const mealData = {
	name: '牛肉麵',
	description: '好吃的牛肉麵',
	price: 120,
	picture: 'https://example.com/beef-noodle.jpg',
	is_available: false,
	customizations: {
		selectionGroups: [
			{
				type: 'radio',
				title: '麵條',
				items: [
					{
						name: '細麵',
						price: 0
					},
					{
						name: '粗麵',
						price: 10
					}
				]
			}
		]
	}
}

beforeAll(async () => {
	store = await createDummyStore()
	user_id = await createUserOfPrivilegeAndReturnUID('consumer')
	meal = await createMeal({ ...mealData, store_id: store.id })
	const another_store = await createDummyStore()
	meal_from_another_store = await createMeal({ ...mealData, store_id: another_store.id })
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
	const order = (await getOrder(order_id))!
	expect(order).toMatchObject({
		id: order_id,
		user_id,
		store_id: store.id,
		notes: '',
		payment_type: 'cash',
		delivery_method: 'pickup',
		state: 'paid',
		details: [
			{
				id: expect.any(Number),
				order_id,
				meal_id: meal.id,
				quantity: 2,
				notes: '不要酸菜',
				calculated_price_per_item: 130, // 120 + 10
				customizations: {
					selectionGroups: getSelectionGroupsWithData(mealData.customizations as CustomizationsType, [
						false,
						true
					])
				}
			}
		]
	})
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
					meal_id: meal_from_another_store.id,
					quantity: 2,
					notes: '不要酸菜',
					customization_statuses: [false, true]
				}
			]
		})
	).rejects.toThrow()
})
