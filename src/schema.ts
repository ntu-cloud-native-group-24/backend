import { Static, Type } from '@sinclair/typebox'

export const LoginUserDef = Type.Object(
	{
		username: Type.String(),
		password: Type.String()
	},
	{ $id: 'LoginUser' }
)
export const LoginUserRef = Type.Ref(LoginUserDef)
export type LoginUserType = Static<typeof LoginUserDef>

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

export const UserDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String()
	},
	{ $id: 'User' }
)
export const UserTypeRef = Type.Ref(UserDef)
export type UserType = Static<typeof UserDef>
