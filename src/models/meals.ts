import { db } from '../db'
import { JsonValue } from '../db/types'
import { validateUICustomizationsOrThrow } from './customizations'
import { UICustomizationsType } from '../schema'

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
	customizations: UICustomizationsType
}) {
	validateUICustomizationsOrThrow(customizations)
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
	const success = await db.transaction().execute(async tx => {
		if (!(await tx.selectFrom('meals').selectAll().where('id', '=', id).executeTakeFirst())) {
			return false
		}
		// we also need to delete the categories associated with the meal before deleting the meal
		// because of foreign key constraints
		await tx.deleteFrom('meal_categories_assoc').where('meal_id', '=', id).execute()
		await tx.deleteFrom('meals').where('id', '=', id).executeTakeFirstOrThrow()
		return true
	})
	return success
}
export async function getAllMealsForStore(store_id: number) {
	return await db.selectFrom('meals').where('store_id', '=', store_id).selectAll().execute()
}
export async function getMealById(id: number) {
	return await db.selectFrom('meals').selectAll().where('id', '=', id).executeTakeFirst()
}
export async function addCategoryToMeal(meal_id: number, category_id: number) {
	// do check if category_id exists for the store owning the meal
	const res = await db
		.insertInto('meal_categories_assoc')
		.values({ category_id, meal_id })
		.returningAll()
		.executeTakeFirst()
	return !!res
}
export async function removeCategoryFromMeal(meal_id: number, category_id: number) {
	const { numDeletedRows } = await db
		.deleteFrom('meal_categories_assoc')
		.where('meal_id', '=', meal_id)
		.where('category_id', '=', category_id)
		.executeTakeFirstOrThrow()
	return numDeletedRows > 0n
}
export async function getCategoriesOfMeal(meal_id: number) {
	return db
		.selectFrom('meal_categories_assoc')
		.innerJoin('store_meal_categories', 'store_meal_categories.id', 'meal_categories_assoc.category_id')
		.where('meal_id', '=', meal_id)
		.select(['name', 'store_meal_categories.id'])
		.execute()
}
