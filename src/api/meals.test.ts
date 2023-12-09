import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createDummyAndCategory, getTokenByUserId } from '../utils/testutils'

let store: any
let category: any
let storeManager: string
let mealResp: any

beforeAll(async () => {
	const obj = await createDummyAndCategory()
	store = obj.store
	category = obj.category
	storeManager = await getTokenByUserId(store.owner_id)
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

test('Creating meals', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/meals`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: meal
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		meal: {
			...meal,
			id: expect.any(Number)
		}
	})
	mealResp = response.json().meal
})
test('Get all meals for store', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/meals`
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({
		success: true,
		meals: [mealResp]
	})
})
test('Get meal by id', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/meals/${mealResp.id}`
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({
		success: true,
		meal: mealResp
	})
})
test('Modify meal', async () => {
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/${store.id}/meals/${mealResp.id}`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			...mealResp,
			is_available: true
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({
		success: true,
		meal: {
			...mealResp,
			is_available: true
		}
	})
})

test('Add category to meal', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/meals/${mealResp.id}/categories`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			category_id: category.id
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({
		success: true
	})
	expect(
		(
			await app.inject({
				method: 'GET',
				url: `/api/store/${store.id}/meals/${mealResp.id}/categories`
			})
		).json()
	).toEqual({
		success: true,
		categories: [
			{
				id: category.id,
				name: expect.any(String)
			}
		]
	})
})
test('Get categories of meal', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/meals/${mealResp.id}/categories`
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({
		success: true,
		categories: [
			{
				id: category.id,
				name: expect.any(String)
			}
		]
	})
})
test('Remove category from meal', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/meals/${mealResp.id}/categories/${category.id}`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({
		success: true
	})
	expect(
		(
			await app.inject({
				method: 'GET',
				url: `/api/store/${store.id}/meals/${mealResp.id}/categories`
			})
		).json()
	).toEqual({
		success: true,
		categories: []
	})
})

test('Delete meal', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/meals/${mealResp.id}`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({
		success: true
	})
	expect(
		(
			await app.inject({
				method: 'GET',
				url: `/api/store/${store.id}/meals/${mealResp.id}`
			})
		).statusCode
	).toBe(404)
})
