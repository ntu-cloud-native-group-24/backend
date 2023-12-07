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
test('Modify store', async () => {
	expect(
		await modifySrore({
			id: store.id,
			...newStoreInfo
		})
	).toEqual({ ...store, ...newStoreInfo })
	expect(await getStoreById(store.id)).toEqual({
		...store,
		...newStoreInfo
	})
})
