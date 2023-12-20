import { Static, Type } from '../typebox-openapi'

export const MealSalesCountQueryDef = Type.Array(Type.Number(), { minItems: 1, $id: 'MealSalesCountQuery' })
export const MealSalesCountQueryRef = Type.Ref(MealSalesCountQueryDef)
export type MealSalesCountQueryType = Static<typeof MealSalesCountQueryDef>

export const MealSalesCountDef = Type.Object(
	{
		meal_id: Type.Number(),
		count: Type.Number()
	},
	{ $id: 'MealSalesCount' }
)
export const MealSalesCountRef = Type.Ref(MealSalesCountDef)
export type MealSalesCountType = Static<typeof MealSalesCountDef>
