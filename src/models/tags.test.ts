import { getAllTags } from './tags'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { addTagToStore, getTagsOfStore, removeTagFromStore } from './tags'
import { createDummyStore } from '../utils/testutils'

let store: any

beforeAll(async () => {
	store = await createDummyStore()
})

test('Get tags', async () => {
	const tags = await getAllTags()
	for (const tagobj of tags) {
		expect(tagobj).toMatchObject({
			id: expect.any(Number),
			name: expect.any(String)
		})
	}
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
