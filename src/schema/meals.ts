import { Static, Type } from '../typebox-openapi'
import { UICustomizationsRef } from './customizations'

export const MealDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String(),
		description: Type.String(),
		price: Type.Number(),
		picture: Type.String(),
		is_available: Type.Boolean(),
		customizations: UICustomizationsRef
	},
	{ $id: 'Meal' }
)
export const MealRef = Type.Ref(MealDef)
export type MealType = Static<typeof MealDef>
export const MealWithoutIdDef = Type.Omit(MealDef, ['id'], {
	$id: 'MealWithoutId'
})
export const MealWithoutIdRef = Type.Ref(MealWithoutIdDef)
export type MealWithoutIdType = Static<typeof MealWithoutIdDef>

export const MealCategoryDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String()
	},
	{ $id: 'MealCategory' }
)
export const MealCategoryRef = Type.Ref(MealCategoryDef)
export type MealCategoryType = Static<typeof MealCategoryDef>
