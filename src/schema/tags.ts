import { Static, Type } from '../typebox-openapi'

export const StoreTagDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String()
	},
	{ $id: 'StoreTag' }
)
export const StoreTagRef = Type.Ref(StoreTagDef)
export type StoreTagType = Static<typeof StoreTagDef>
