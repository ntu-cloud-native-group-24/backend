import { db } from '../db'
import { Json, JsonValue } from '../db/types'

export async function createMeal({
	name,
	description,
	price,
	picture,
	is_available,
	store_id,
	customizations
}: {
	name: string
	description: string
	price: number
	picture: string
	is_available: boolean
	store_id: number
	customizations: JsonValue
}) {
	const res = await db
		.insertInto('meals')
		.values({
			name,
			description,
			price,
			picture,
			is_available,
			store_id,
			customizations: JSON.stringify(customizations)
		})
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
export async function modifyMeal(
	store_id: number,
	obj: {
		id: number
		name: string
		description: string
		price: number
		picture: string
		category: string
		is_available: boolean
		customizations: JsonValue
	}
) {
	const res = await db
		.updateTable('meals')
		.set({
			...obj,
			customizations: JSON.stringify(obj.customizations)
		})
		.where('id', '=', obj.id)
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
export async function getAllMeals() {
	return await db.selectFrom('meals').selectAll().execute()
}
export async function getMealById(id: number) {
	return await db.selectFrom('meals').selectAll().where('id', '=', id).executeTakeFirst()
}
