import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilegeAndReturnToken } from '../utils/testutils'

let consumer: string
let storeManager: string
let store: any
let openingHoursResp: any

const storeInfo = {
	name: 'Haachama Cooking',
	description: 'Haachama Cooking 123',
	address: 'Tokyo, Japan',
	picture_url: 'https://www.youtube.com/watch?v=IT186xDTwUU',
	status: false,
	phone: '7777777777',
	email: 'akaihaato@example.com'
}
const storeInfo2 = {
	address: 'Australia',
	status: true
}
const storeInfo3 = {
	description: 'Back to Japan',
	address: 'Tokyo, Japan'
}

beforeAll(async () => {
	consumer = await createUserOfPrivilegeAndReturnToken(app, 'consumer')
	storeManager = await createUserOfPrivilegeAndReturnToken(app, 'store_manager')
})

test('Create store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/store',
		headers: {
			'X-API-KEY': storeManager
		},
		payload: storeInfo
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		store: {
			id: expect.any(Number),
			...storeInfo
		}
	})
	store = response.json().store
})
test('Get store by id', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}`
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		store: {
			id: store.id,
			...storeInfo
		}
	})
})
test('Get stores', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store`
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({ success: true, stores: expect.any(Array) })
	expect(response.json().stores).toEqual(
		expect.arrayContaining([
			{
				id: store.id,
				...storeInfo
			}
		])
	)
})
test("Consumer can't create store", async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/store',
		headers: {
			'X-API-KEY': consumer
		},
		payload: storeInfo
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({ success: false })
})
test('Modify store with PUT', async () => {
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/${store.id}`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: {
			...storeInfo,
			...storeInfo2
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		store: {
			id: store.id,
			...storeInfo,
			...storeInfo2
		}
	})
})
test('Modify store with PUT (incomplete info)', async () => {
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/${store.id}`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: storeInfo2
	})
	expect(response.statusCode).toBe(400)
})
test('Modify store with PATCH', async () => {
	const response = await app.inject({
		method: 'PATCH',
		url: `/api/store/${store.id}`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: storeInfo3
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		store: {
			id: store.id,
			...storeInfo,
			...storeInfo2,
			...storeInfo3
		}
	})
})
test('Consumer can not modify store', async () => {
	const response = await app.inject({
		method: 'PATCH',
		url: `/api/store/${store.id}`,
		headers: {
			'X-API-KEY': consumer
		},
		payload: storeInfo3
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({ success: false })
})
test('Non-owner can not modify store', async () => {
	const storeManager2 = await createUserOfPrivilegeAndReturnToken(app, 'store_manager')
	const response = await app.inject({
		method: 'PATCH',
		url: `/api/store/${store.id}`,
		headers: {
			'X-API-KEY': storeManager2
		},
		payload: storeInfo3
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({ success: false })
})

const tag_id = 1
const bad_tag_id = 0
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
