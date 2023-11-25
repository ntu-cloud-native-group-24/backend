import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilege } from '../utils/testutils'

let consumer: string
let storeManager: string
let storeId: number

const storeInfo = {
	name: 'Haachama Cooking',
	description: 'Haachama Cooking 123',
	address: 'Tokyo, Japan',
	picture_url: 'https://www.youtube.com/watch?v=IT186xDTwUU'
}

beforeAll(async () => {
	consumer = await createUserOfPrivilege(app, 'consumer')
	storeManager = await createUserOfPrivilege(app, 'store_manager')
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
	expect(response.json()).toMatchObject({ id: expect.any(Number) })
	storeId = response.json().id
})
test('Get store by id', async () => {
	const response = await app.inject({
		method: 'GET',
		url: `/api/store/${storeId}`
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		store: {
			id: storeId,
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
				id: storeId,
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
