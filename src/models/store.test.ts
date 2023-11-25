import { test, expect, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilegeAndReturnUID } from '../utils/testutils'
import { createStore, getStoreById, getAllStores } from './store'

let consumer: number
let store_manager: number

const storeInfo = {
	name: 'test',
	description: 'test',
	address: 'test',
	picture_url: 'test'
}

beforeAll(async () => {
	consumer = await createUserOfPrivilegeAndReturnUID('consumer')
	store_manager = await createUserOfPrivilegeAndReturnUID('store_manager')
})

test('Create store', async () => {
	const store = await createStore({
		user_id: store_manager,
		...storeInfo
	})
	expect(store).toEqual(expect.any(Number))
	expect(await getStoreById(store!)).toEqual({
		id: store,
		owner_id: store_manager,
		...storeInfo
	})
	expect(await getAllStores()).toContainEqual({
		id: store,
		owner_id: store_manager,
		...storeInfo
	})
})

test('Create store as consumer', async () => {
	const store = await createStore({
		user_id: consumer,
		...storeInfo
	})
	expect(store).toBe(null)
})
