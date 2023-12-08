import { db } from '../db'
import { JsonValue } from '../db/types'

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
	id: number,
	obj: {
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
		.where('id', '=', id)
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
export async function deleteMeal(id: number) {
	const { numDeletedRows } = await db.deleteFrom('meals').where('id', '=', id).executeTakeFirstOrThrow()
	return numDeletedRows > 0n
}
export async function getAllMealsForStore(store_id: number) {
	return await db.selectFrom('meals').where('store_id', '=', store_id).selectAll().execute()
}
export async function getMealById(id: number) {
	return await db.selectFrom('meals').selectAll().where('id', '=', id).executeTakeFirst()
}
