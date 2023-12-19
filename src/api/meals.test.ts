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

test('Creating meals to non-exist store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/0/meals`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: meal
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Store not found'
	})
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

test('Get all meals for non-exist store', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/0/meals`
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Store not found'
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

test('Get all meals by id from non-exist store', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/0/meals/0`
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Store not found'
	})
})

test('Modify meal from non-exist store', async () => {
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/0/meals/0`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			...mealResp,
			is_available: true
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Store not found'
	})
})

test('Modify not-exist meal', async () => {
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/${store.id}/meals/0`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			...mealResp,
			is_available: true
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Meal not found'
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

test('Add category to meal to not-exist store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/0/meals/0/categories`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			category_id: 0
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Store not found'
	})
})

test('Add category to not-exist meal', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/meals/0/categories`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			category_id: 0
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Meal not found'
	})
})

test('Add not-exist category to meal', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/meals/${mealResp.id}/categories`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			category_id: 0
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Category not found for store'
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

test('Get categories of meal from not-exist store', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/0/meals/0/categories`
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Store not found'
	})
})

test('Get categories of not-exist meal', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/meals/0/categories`
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Meal not found'
	})
})

test('Remove category to meal to not-exist store', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/0/meals/0/categories/0`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Store not found'
	})
})

test('Remove category to not-exist meal', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/meals/0/categories/0`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Meal not found'
	})
})

test('Remove not-exist category to meal', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/meals/${mealResp.id}/categories/0`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toEqual({
		success: false,
		message: 'Category not found for store'
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

test('Get meal of non-existing store', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/0/meals`
	})
	expect(response.statusCode).toBe(404)
})
test('Get one meal of non-existing store', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/0/meals/0`
	})
	expect(response.statusCode).toBe(404)
})
test('Get non-existing meal', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/meals/0`
	})
	expect(response.statusCode).toBe(404)
})
test('Post meal to non-existing store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/0/meals`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: meal
	})
	expect(response.statusCode).toBe(404)
})
test('Modify meal of non-existing store', async () => {
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/0/meals/0`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: mealResp
	})
	expect(response.statusCode).toBe(404)
})
test('Modify non-existing meal', async () => {
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/${store.id}/meals/0`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: mealResp
	})
	expect(response.statusCode).toBe(404)
})
test('Delete meal of non-existing store', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/0/meals/0`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
})
test('Delete non-existing meal', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/meals/0`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
})
test('Get category to meal of non-existing store', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/0/meals/0/categories`
	})
	expect(response.statusCode).toBe(404)
})
test('Get category of non-existing meal', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/meals/0/categories`
	})
	expect(response.statusCode).toBe(404)
})
test('Post category to meal of non-existing store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/0/meals/0/categories`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			category_id: category.id
		}
	})
	expect(response.statusCode).toBe(404)
})
test('Post category to non-existing meal', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/meals/0/categories`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			category_id: category.id
		}
	})
	expect(response.statusCode).toBe(404)
})
test('Delete category from meal of non-existing store', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/0/meals/0/categories/${category.id}`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
})
test('Delete category from non-existing meal', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/meals/0/categories/${category.id}`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
})
test('Delete non-existing category from meal', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/meals/${mealResp.id}/categories/0`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
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
