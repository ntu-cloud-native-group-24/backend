import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createDummyStore, getTokenByUserId } from '../utils/testutils'

let store: any
let storeManager: string
let mealResp: any

beforeAll(async () => {
	store = await createDummyStore()
	storeManager = await getTokenByUserId(store.owner_id)
})

const meal = {
	name: '牛肉麵',
	description: '好吃的牛肉麵',
	price: 120,
	picture: 'https://example.com/beef-noodle.jpg',
	is_available: false,
	customizations: {
		options: [
			{
				type: 'radio',
				name: '麵條',
				options: [
					{
						name: '細麵',
						price: 0
					},
					{
						name: '粗麵',
						price: 20
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
