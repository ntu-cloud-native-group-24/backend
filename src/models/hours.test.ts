import { getAllTags } from './tags'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { addOpeningHours, getOpeningHoursByStoreId, deleteOpeningHours } from './hours'
import { createDummyStore } from '../utils/testutils'

let store: any
let openingHoursResp: any
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
	store = await createDummyStore()
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
