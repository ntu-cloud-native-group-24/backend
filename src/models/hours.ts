import { db } from '../db'

export async function addOpeningHours(
	store_id: number,
	{
		day,
		open_time,
		close_time
	}: {
		day: number
		open_time: string
		close_time: string
	}
) {
	const res = await db
		.insertInto('stores_opening_hours')
		.values({
			store_id,
			day,
			open_time,
			close_time
		})
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
export async function getOpeningHoursByStoreId(store_id: number) {
	return db.selectFrom('stores_opening_hours').where('store_id', '=', store_id).selectAll().execute()
}
export async function deleteOpeningHours(id: number) {
	return db.deleteFrom('stores_opening_hours').where('id', '=', id).execute()
}
