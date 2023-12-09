import { getAllTags } from './tags'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createDummyAndCategory } from '../utils/testutils'
import {
	createMeal,
	modifyMeal,
	deleteMeal,
	getAllMealsForStore,
	getMealById,
	addCategoryToMeal,
	removeCategoryFromMeal,
	getCategoriesOfMeal
} from './meals'
import { UICustomizationsType } from '../schema/customizations'

let store: any
let category: any
let mealObj: any

beforeAll(async () => {
	const obj = await createDummyAndCategory()
	store = obj.store
	category = obj.category
})

const meal = {
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

test('createMeal', async () => {
	const res = await createMeal({ ...meal, store_id: store.id })
	expect(res).toEqual({ ...meal, store_id: store.id, id: expect.any(Number) })
	mealObj = res
})

test('Get all meals for store', async () => {
	const res = await getAllMealsForStore(store.id)
	expect(res).toEqual([mealObj])
})

test('Get meal by id', async () => {
	const res = await getMealById(mealObj.id)
	expect(res).toEqual(mealObj)
})

test('modifyMeal', async () => {
	const res = await modifyMeal(mealObj.id, { ...mealObj, is_available: true })
	expect(res).toEqual({ ...mealObj, is_available: true })
	expect(await getMealById(mealObj.id)).toEqual({ ...mealObj, is_available: true })
})

test('Add category to meal', async () => {
	const res = await addCategoryToMeal(mealObj.id, category.id)
	expect(res).toBe(true)
	expect(await getCategoriesOfMeal(mealObj.id)).toContainEqual({
		name: category.name,
		id: category.id
	})
})

test('Remove category from meal', async () => {
	const res = await removeCategoryFromMeal(mealObj.id, category.id)
	expect(res).toBe(true)
	expect(await getCategoriesOfMeal(mealObj.id)).not.toContainEqual({
		name: category.name,
		id: category.id
	})
})

test('Delete meal', async () => {
	const res = await deleteMeal(mealObj.id)
	expect(res).toBe(true)
	expect(await getMealById(mealObj.id)).toBeUndefined()
	expect(await deleteMeal(mealObj.id)).toBe(false)
})

test('Delete meal with category works', async () => {
	const mealObj = await createMeal({ ...meal, store_id: store.id })
	await addCategoryToMeal(mealObj.id, category.id)
	const res = await deleteMeal(mealObj.id)
	expect(res).toBe(true)
})
