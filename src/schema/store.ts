import { Static, Type } from '../typebox-openapi'
import { OrderRef } from './orders'

export const StoreDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String(),
		description: Type.String(),
		address: Type.String(),
		picture_url: Type.String(),
		status: Type.Boolean(),
		phone: Type.String(),
		email: Type.String()
	},
	{ $id: 'Store' }
)
export const StoreRef = Type.Ref(StoreDef)
export type StoreType = Static<typeof StoreDef>

export const StoreWithoutIdDef = Type.Omit(StoreDef, ['id'], {
	$id: 'StoreWithoutId'
})
export const StoreWithoutIdRef = Type.Ref(StoreWithoutIdDef)
export type StoreWithoutIdType = Static<typeof StoreWithoutIdDef>

export const MonthlyOrderStatsDef = Type.Object(
	{
		month: Type.String(),
		orders: Type.Array(OrderRef)
	},
	{ $id: 'MonthlyOrderStats' }
)
export const MonthlyOrderStatsRef = Type.Ref(MonthlyOrderStatsDef)
export type MonthlyOrderStatsType = Static<typeof MonthlyOrderStatsDef>
