import { test, expect, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilegeAndReturnUID } from '../utils/testutils'
import { createStore, getStoreById, getAllStores, modifySrore } from './store'

let consumer: number
let store_manager: number
let store: any
let openingHoursResp: any

const storeInfo = {
	name: 'test',
	description: 'test',
	address: 'test',
	picture_url: 'test',
	status: false,
	phone: '+886 1145141919',
	email: 'abcd@example.com'
}
const newStoreInfo = {
	description: 'new test desc',
	address: 'new test addr',
	status: true
}

beforeAll(async () => {
	consumer = await createUserOfPrivilegeAndReturnUID('consumer')
	store_manager = await createUserOfPrivilegeAndReturnUID('store_manager')
})

test('Create store', async () => {
	store = await createStore({
		owner_id: store_manager,
		...storeInfo
	})
	expect(store.id).toEqual(expect.any(Number))
	expect(await getStoreById(store.id)).toEqual({
		id: store.id,
		owner_id: store_manager,
		...storeInfo
	})
	expect(await getAllStores()).toContainEqual({
		id: store.id,
		owner_id: store_manager,
		...storeInfo
	})
})

test('Create store as consumer', async () => {
	const store = await createStore({
		owner_id: consumer,
		...storeInfo
	})
	expect(store).toBe(null)
})

test('Modify store', async () => {
	expect(
		await modifySrore(store_manager, {
			id: store.id,
			...newStoreInfo
		})
	).toEqual({ ...store, ...newStoreInfo })
	expect(await getStoreById(store.id)).toEqual({
		...store,
		...newStoreInfo
	})
})
test('Modify store as consumer', async () => {
	expect(
		await modifySrore(consumer, {
			id: store.id,
			...newStoreInfo
		})
	).toBe(null)
})
test('Modify store as another store manager', async () => {
	const store_manager2 = await createUserOfPrivilegeAndReturnUID('store_manager')
	expect(
		await modifySrore(store_manager2, {
			id: store.id,
			...newStoreInfo
		})
	).toBe(null)
	expect(await getStoreById(store.id)).toEqual({
		...store,
		...newStoreInfo
	})
})
