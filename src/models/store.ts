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
export async function modifySrore(obj: {
	id: number
	name: string
	description: string
	address: string
	picture_url: string
	status: boolean
	phone: string
	email: string
}) {
	const res = await db
		.updateTable('stores')
		.set(obj)
		.where('id', '=', obj.id)
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
export async function getAllStores({ user_id }: { user_id?: number } = {}) {
	let query = db.selectFrom('stores').selectAll()
	if (user_id) {
		query = query.where('owner_id', '=', user_id)
	}
	return await query.execute()
}
export async function getStoreById(id: number) {
	return await db.selectFrom('stores').selectAll().where('id', '=', id).executeTakeFirst()
}
