import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { createDummyStore } from '../utils/testutils'
import { createStoreCategory, getStoreCategoriesByStore, getStoreCategoryByStoreAndId } from './store_categories'

let store: any
let store_category: any

beforeAll(async () => {
	store = await createDummyStore()
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
