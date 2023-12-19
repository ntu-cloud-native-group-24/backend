import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createDummyStore, getTokenByUserId } from '../utils/testutils'

let store: any
let storeManager: string

beforeAll(async () => {
	store = await createDummyStore()
	storeManager = await getTokenByUserId(store.owner_id)
})

test('Get tags', async () => {
	const response = await app.inject({
		method: 'GET',
		url: '/api/tags'
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		tags: expect.any(Array)
	})
	for (const tagobj of response.json().tags) {
		expect(tagobj).toMatchObject({
			id: expect.any(Number),
			name: expect.any(String)
		})
	}
})

const tag_id = 1
const bad_tag_id = 0
test('Get tag of a store', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/0/tags`,
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
test('Add tag to store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/tags`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			tag_id
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({ success: true })
	const response2 = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/tags`
	})
	expect(response2.statusCode).toBe(200)
	expect(response2.json()).toMatchObject({
		success: true,
		tags: [
			{
				id: tag_id,
				name: expect.any(String)
			}
		]
	})
})
test('Remove tag from store', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/tags/${tag_id}`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({ success: true })
	const response2 = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/tags`
	})
	expect(response2.statusCode).toBe(200)
	expect(response2.json()).toMatchObject({
		success: true,
		tags: []
	})
})
test('Removing non-existing tag from store', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/tags/${tag_id}`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({ success: false })
})
test('Add non-existing tag to store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/tags`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			tag_id: bad_tag_id
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({ success: false })
})
