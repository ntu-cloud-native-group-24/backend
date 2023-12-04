import { db } from '../db'
import { Json } from '../db/types'

export async function createMeal({
	name,
	description,
	price,
	picture,
	category,
	is_available,
	store_id,
	customizations
}: {
	name: string
	description: string
	price: number
	picture: string
	category: string
	is_available: boolean
	store_id: number
    // may need to change the customizations
	customizations: string
}) {
	const res = await db
		.insertInto('meals')
		.values({
			name,
			description,
			price,
			picture,
			category,
			is_available,
			store_id,
            // may need to change the customizations
			customizations
		})
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
export async function modifyMeal(
	store_id: number,
	obj: {
        id: number
		name?: string
		description?: string
		price?: number
		picture?: string
		category?: string
		is_available?: boolean
        // may need to change the customizations
		customizations?: string
	}
) {
    // not yet verify the meal is in the store
    const res = await db
        .updateTable('meals')
        .set(obj)
        .where('id', '=', obj.id)
        .returningAll()
        .executeTakeFirstOrThrow()
    return res
}
export async function getAllMeals() {
	return await db.selectFrom('meals').selectAll().execute()
}
export async function getMealById(id: number){
    return await db.selectFrom('meals').selectAll().where('id', '=', id).executeTakeFirstOrThrow()
}