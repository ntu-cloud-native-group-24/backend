import { test, expect, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilegeAndReturnUID } from '../utils/testutils'
import {
	createStore,
	getStoreById,
	getAllStores,
	modifySrore,
	addOpeningHours,
	getOpeningHoursByStoreId,
	deleteOpeningHours,
	addTagToStore,
	removeTagFromStore,
	getTagsOfStore
} from './store'

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

test('Add opening hours', async () => {
	for (const hour of openingHours) {
		await addOpeningHours(store.id, hour)
	}
	openingHoursResp = await getOpeningHoursByStoreId(store.id)
	expect(openingHoursResp).toEqual(
		openingHours.map(hour => ({
			id: expect.any(Number),
			store_id: store.id,
			...hour
		}))
	)
})
test('Delete opening hours', async () => {
	await deleteOpeningHours(openingHoursResp[0].id)
	expect(await getOpeningHoursByStoreId(store.id)).toEqual(openingHoursResp.slice(1))
})

const tag_id = 1
const bad_tag_id = 0
test('Add tag to store', async () => {
	expect(await addTagToStore(store.id, tag_id)).toBe(true)
	expect(await getTagsOfStore(store.id)).toMatchObject([
		{
			id: tag_id,
			name: expect.any(String)
		}
	])
})
test('Remove tag from store', async () => {
	expect(await removeTagFromStore(store.id, tag_id)).toBe(true)
	expect(await getTagsOfStore(store.id)).toEqual([])
})
test('Removing non-existing tag from store', async () => {
	expect(await removeTagFromStore(store.id, tag_id)).toBe(false)
	expect(await getTagsOfStore(store.id)).toEqual([])
})
test('Adding non-existing tag to store', async () => {
	expect(await addTagToStore(store.id, bad_tag_id)).toBe(false)
	expect(await getTagsOfStore(store.id)).toEqual([])
})
