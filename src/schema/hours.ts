import { Static, Type } from '../typebox-openapi'

export const StoreOpeningHoursDef = Type.Object(
	{
		id: Type.Number(),
		day: Type.Number(),
		open_time: Type.String(),
		close_time: Type.String()
	},
	{ $id: 'StoreOpeningHours' }
)
export const StoreOpeningHoursRef = Type.Ref(StoreOpeningHoursDef)
export type StoreOpeningHoursType = Static<typeof StoreOpeningHoursDef>

export const StoreOpeningHoursWithoutIdDef = Type.Omit(StoreOpeningHoursDef, ['id'], {
	$id: 'StoreOpeningHoursWithoutId'
})
export const StoreOpeningHoursWithoutIdRef = Type.Ref(StoreOpeningHoursWithoutIdDef)
export type StoreOpeningHoursWithoutIdType = Static<typeof StoreOpeningHoursWithoutIdDef>
