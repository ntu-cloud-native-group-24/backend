import { Static, Type } from '../typebox-openapi'

export const StoreCategoryDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String()
	},
	{ $id: 'StoreCategory' }
)
export const StoreCategoryRef = Type.Ref(StoreCategoryDef)
export type StoreCategoryType = Static<typeof StoreCategoryDef>

export const StoreCategoryWithoutIdDef = Type.Omit(StoreCategoryDef, ['id'], {
	$id: 'StoreCategoryWithoutId'
})
export const StoreCategoryWithoutIdRef = Type.Ref(StoreCategoryWithoutIdDef)
export type StoreCategoryWithoutIdType = Static<typeof StoreCategoryWithoutIdDef>
