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
const openingHours = [
	{
		day: 3,
		open_time: '09:30:00',
		close_time: '18:00:30'
	},
	{
		day: 5,
		open_time: '10:00:00',
		close_time: '18:00:00'
	}
]

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

test('Add Opening Hours', async () => {
	for (const hour of openingHours) {
		await app.inject({
			method: 'POST',
			url: `/api/store/${store.id}/hours`,
			headers: {
				'X-API-KEY': storeManager
			},
			payload: hour
		})
	}
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/hours`
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		hours: openingHours.map(hour => ({
			id: expect.any(Number),
			...hour
		}))
	})
	openingHoursResp = response.json().hours
})
test('Delete Opening Hours', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/hours/${openingHoursResp[0].id}`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({ success: true })

	const response2 = await app.inject({
		method: 'GET',
		url: `/api/store/${store.id}/hours`
	})
	expect(response2.statusCode).toBe(200)
	expect(response2.json()).toMatchObject({
		success: true,
		hours: openingHoursResp.slice(1)
	})
})
