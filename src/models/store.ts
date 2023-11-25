import { db } from '../db'
import { checkUserPrivilege } from './privileges'

export function isStoreManager(user_id: number) {
	return checkUserPrivilege(user_id, 'store_manager')
}
export async function createStore({
	user_id,
	name,
	description,
	address,
	picture_url
}: {
	user_id: number
	name: string
	description: string
	address: string
	picture_url: string
}) {
	if (!(await isStoreManager(user_id))) {
		return null
	}
	const { id } = await db
		.insertInto('stores')
		.values({
			owner_id: user_id,
			name,
			description,
			address,
			picture_url
		})
		.returning('id')
		.executeTakeFirstOrThrow()
	return id
}
export async function getAllStores() {
	return await db.selectFrom('stores').selectAll().execute()
}
export async function getStoreById(id: number) {
	return await db.selectFrom('stores').selectAll().where('id', '=', id).executeTakeFirst()
}
