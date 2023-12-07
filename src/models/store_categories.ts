import { db } from '../db'

export async function createStoreCategory({ store_id, name }: { store_id: number; name: string }) {
	const res = await db
		.insertInto('store_meal_categories')
		.values({
			store_id,
			name
		})
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}

export async function getStoreCategoriesByStore(store_id: number) {
	return db.selectFrom('store_meal_categories').where('store_id', '=', store_id).selectAll().execute()
}

export async function getStoreCategoryByStoreAndId(store_id: number, category_id: number) {
	return db
		.selectFrom('store_meal_categories')
		.where('store_id', '=', store_id)
		.where('id', '=', category_id)
		.selectAll()
		.executeTakeFirst()
}
