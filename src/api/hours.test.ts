import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createDummyStore, getTokenByUserId } from '../utils/testutils'

let store: any
let storeManager: string
let openingHoursResp: any

beforeAll(async () => {
	store = await createDummyStore()
	storeManager = await getTokenByUserId(store.owner_id)
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
