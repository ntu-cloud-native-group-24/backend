import { db } from '../db'

export async function getAllMealTags() {
	return db.selectFrom('meal_tags').select(['id', 'name']).execute()
}
