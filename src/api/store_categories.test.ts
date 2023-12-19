import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createDummyStore, getTokenByUserId } from '../utils/testutils'

let store: any
let storeManager: string
let categoryResp: any

beforeAll(async () => {
	store = await createDummyStore()
	storeManager = await getTokenByUserId(store.owner_id)
})

const category = '火鍋'

test('Creating categories', async () => {
	const resp = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/category`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			name: category
		}
	})
	expect(resp.statusCode).toBe(200)
	expect(resp.json()).toMatchObject({
		success: true,
		category: {
			id: expect.any(Number),
			name: category
		}
	})
	categoryResp = resp.json().category
})
test('Getting categories', async () => {
	const resp = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/category`
	})
	expect(resp.statusCode).toBe(200)
	expect(resp.json()).toMatchObject({
		success: true,
		categories: [
			{
				id: expect.any(Number),
				name: category
			}
		]
	})
})
test('Getting specific category', async () => {
	const resp = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/category/${categoryResp.id}`
	})
	expect(resp.statusCode).toBe(200)
	expect(resp.json()).toMatchObject({
		success: true,
		category: {
			id: expect.any(Number),
			name: category
		}
	})
})
test('Get category of non-existing store', async () => {
	const resp = await app.inject({
		method: 'GET',
		url: `/api/store/0/category`
	})
	expect(resp.statusCode).toBe(404)
	expect(resp.json()).toMatchObject({
		success: false,
		message: 'Store not found'
	})
})
test('Get one category of non-existing store', async () => {
	const resp = await app.inject({
		method: 'GET',
		url: `/api/store/0/category/0`
	})
	expect(resp.statusCode).toBe(404)
	expect(resp.json()).toMatchObject({
		success: false,
		message: 'Store not found'
	})
})
test('Post category to non-existing store', async () => {
	const resp = await app.inject({
		method: 'POST',
		url: `/api/store/0/category`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			name: category
		}
	})
	expect(resp.statusCode).toBe(404)
	expect(resp.json()).toMatchObject({
		success: false,
		message: 'Store not found'
	})
})
test('Get non-existing category', async () => {
	const resp = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/category/0`
	})
	expect(resp.statusCode).toBe(404)
	expect(resp.json()).toMatchObject({
		success: false,
		message: 'Category not found'
	})
})
