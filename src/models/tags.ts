import { db } from '../db'

export async function getAllTags() {
	return db.selectFrom('store_tags').select(['id', 'name']).execute()
}
export async function addTagToStore(store_id: number, tag_id: number) {
	try {
		const res = await db
			.insertInto('store_tags_assoc')
			.values({
				store_id,
				tag_id
			})
			.returningAll()
			.executeTakeFirst()
		return !!res
	} catch (e) {
		// in case tag_id does not exist (foreign key constraint)
		return false
	}
}
export async function removeTagFromStore(store_id: number, tag_id: number) {
	const res = await db
		.deleteFrom('store_tags_assoc')
		.where('store_id', '=', store_id)
		.where('tag_id', '=', tag_id)
		.returningAll()
		.executeTakeFirst()
	return !!res
}
export async function getTagsOfStore(store_id: number) {
	return db
		.selectFrom('store_tags_assoc')
		.where('store_id', '=', store_id)
		.leftJoin('store_tags', 'store_tags_assoc.tag_id', 'store_tags.id')
		.select(['name', 'tag_id as id'])
		.execute()
}
