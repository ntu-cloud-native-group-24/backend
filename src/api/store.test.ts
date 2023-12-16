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
	...storeInfo,
	address: 'Australia',
	status: true
}
const storeInfo3 = {
	...storeInfo,
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
test('Get stores owned by user', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/me/stores`,
		headers: {
			'X-API-KEY': storeManager
		}
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
	expect(response.statusCode).toBe(401)
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
	const tmp = { ...storeInfo2 }
	delete (tmp as any).address
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/${store.id}`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: tmp
	})
	expect(response.statusCode).toBe(400)
})
test('Consumer can not modify store', async () => {
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/${store.id}`,
		headers: {
			'X-API-KEY': consumer
		},
		payload: storeInfo3
	})
	expect(response.statusCode).toBe(401)
	expect(response.json()).toMatchObject({ success: false })
})
test('Non-owner can not modify store', async () => {
	const storeManager2 = await createUserOfPrivilegeAndReturnToken(app, 'store_manager')
	const response = await app.inject({
		method: 'PUT',
		url: `/api/store/${store.id}`,
		headers: {
			'X-API-KEY': storeManager2
		},
		payload: storeInfo3
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({ success: false })
})
