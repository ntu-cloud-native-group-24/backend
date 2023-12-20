import {
	createDummyStore,
	createUserOfPrivilegeAndReturnUID,
	createDummyAndCategory,
	createDummyMeal,
	createDummyOrder,
	setOrderState
} from '../utils/testutils'
import { getMealSalesCount as getMealSales } from './stats'
import { jest, test, describe, beforeAll, expect } from '@jest/globals'

let store: Awaited<ReturnType<typeof createDummyStore>>
let user_id: Awaited<ReturnType<typeof createUserOfPrivilegeAndReturnUID>>

beforeAll(async () => {
	store = await createDummyStore()
	user_id = await createUserOfPrivilegeAndReturnUID('consumer')
})

test('get meal sales count', async () => {
	const meals: Awaited<ReturnType<typeof createDummyMeal>>[] = []
	for (let i = 0; i < 5; i++) {
		meals.push(await createDummyMeal(store.id))
	}
	for (let i = 0; i < 5; i++) {
		const order_id = await createDummyOrder(user_id, store.id, meals[i].id, i + 1)
		await setOrderState(order_id, 'completed')
	}
	for (let i = 0; i < 5; i++) {
		await createDummyOrder(user_id, store.id, meals[i].id, i + 1)
	}
	for (let i = 0; i < 5; i++) {
		const order_id = await createDummyOrder(user_id, store.id, meals[i].id, 3)
		await setOrderState(order_id, 'completed')
	}
	const cmp = (a: any, b: any) => a.meal_id - b.meal_id
	const res = (await getMealSales(meals.map(x => x.id))).sort(cmp)
	const rhs = meals.map((x, i) => ({ meal_id: x.id, count: i + 1 + 3 })).sort(cmp)
	expect(res.sort(cmp)).toEqual(rhs)
})
