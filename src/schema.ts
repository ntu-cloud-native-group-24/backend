import { Static, Type } from '@sinclair/typebox'

export const RegisterUserDef = Type.Object(
	{
		name: Type.String(),
		username: Type.String(),
		password: Type.String()
	},
	{ $id: 'RegisterUser' }
)
export const RegisterUserRef = Type.Ref(RegisterUserDef)
export type RegisterUserType = Static<typeof RegisterUserDef>

export const StoreDef = Type.Object(
	{
		id: Type.String({ format: 'uuid' }),
		displayName: Type.String(),
		storePicture: Type.String()
	},
	{ $id: 'Store' }
)
export const StoreTypeRef = Type.Ref(StoreDef)
export type StoreType = Static<typeof StoreDef>
