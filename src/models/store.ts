import { db } from '../db'
import { checkUserPrivilege } from './privileges'

export function isStoreManager(user_id: number) {
	return checkUserPrivilege(user_id, 'store_manager')
}
export async function createStore({
	owner_id,
	name,
	description,
	address,
	picture_url,
	status,
	phone,
	email
}: {
	owner_id: number
	name: string
	description: string
	address: string
	picture_url: string
	status: boolean
	phone: string
	email: string
}) {
	if (!(await isStoreManager(owner_id))) {
		return null
	}
	const res = await db
		.insertInto('stores')
		.values({
			owner_id,
			name,
			description,
			address,
			picture_url,
			status,
			phone,
			email
		})
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
export async function modifySrore(
	user_id: number,
	obj: {
		id: number
		owner_id?: number
		name?: string
		description?: string
		address?: string
		picture_url?: string
		status?: boolean
		phone?: string
		email?: string
	}
) {
	if (!(await isStoreManager(user_id))) {
		return null
	}
	if ((await getStoreById(obj.id))?.owner_id !== user_id) {
		return null
	}
	const res = await db
		.updateTable('stores')
		.set(obj)
		.where('id', '=', obj.id)
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
export async function getAllStores() {
	return await db.selectFrom('stores').selectAll().execute()
}
export async function getStoreById(id: number) {
	return await db.selectFrom('stores').selectAll().where('id', '=', id).executeTakeFirst()
}
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
