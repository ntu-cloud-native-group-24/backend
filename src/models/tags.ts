import { db } from '../db'

export async function getAllTags() {
	return db.selectFrom('store_tags').select(['id', 'name']).execute()
}
