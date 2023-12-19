import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createDummyStore, createUserOfPrivilegeAndReturnUID, getTokenByUserId } from '../utils/testutils'

let store: any
let storeManager: string
let openingHoursResp: any
let storeId2: number
let storeManager2: string

beforeAll(async () => {
	store = await createDummyStore()
	storeManager = await getTokenByUserId(store.owner_id)
	storeId2 = await createUserOfPrivilegeAndReturnUID('store_manager')
	storeManager2 = await getTokenByUserId(storeId2)
})

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
test('Get non-existent store opening hours', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/0/hours`
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toMatchObject({
		success: false,
		message: 'Store not found'
	})
})
test('Add opening hours to non-existent store', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/0/hours`,
		headers: {
			'X-API-KEY': storeManager
		},
		payload: openingHours[0]
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toMatchObject({
		success: false,
		message: 'Store not found'
	})
})
test('Add opening hours (not store owner)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: `/api/store/${store.id}/hours`,
		headers: {
			'X-API-KEY': storeManager2
		},
		payload: openingHours[0]
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({
		success: false,
		message: 'You are not the owner of this store'
	})
})
test('Delete opening hours from non-existent store', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/0/hours/0`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(404)
	expect(response.json()).toMatchObject({
		success: false,
		message: 'Store not found'
	})
})
test('Delete non-existent opening hours', async () => {
	const response = await app.inject({
		method: 'DELETE',
		url: `/api/store/${store.id}/hours/0`,
		headers: {
			'X-API-KEY': storeManager
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toMatchObject({
		success: false,
		message: 'Unable to delete opening hours'
	})
})
