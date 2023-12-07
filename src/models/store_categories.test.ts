import { test, expect, beforeAll, jest } from '@jest/globals'
import { createUserOfPrivilegeAndReturnUID } from '../utils/testutils'
import { createStore } from './store'
import { createStoreCategory, getStoreCategoriesByStore, getStoreCategoryByStoreAndId } from './store_categories'

let store_manager: number
let store: any
let store_category: any

const storeInfo = {
	name: 'test',
	description: 'test',
	address: 'test',
	picture_url: 'test',
	status: false,
	phone: '+886 1145141919',
	email: 'abcd@example.com'
}

beforeAll(async () => {
	store_manager = await createUserOfPrivilegeAndReturnUID('store_manager')
	store = await createStore({
		owner_id: store_manager,
		...storeInfo
	})
})

const storeCategoryInfo = {
	name: '主餐'
}

test('Create store category', async () => {
	store_category = await createStoreCategory({
		store_id: store.id,
		...storeCategoryInfo
	})
	expect(store_category.id).toEqual(expect.any(Number))
	expect(await getStoreCategoriesByStore(store.id)).toContainEqual({
		id: store_category.id,
		store_id: store.id,
		...storeCategoryInfo
	})
	expect(await getStoreCategoryByStoreAndId(store.id, store_category.id)).toEqual({
		id: store_category.id,
		store_id: store.id,
		...storeCategoryInfo
	})
})
