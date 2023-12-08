import { Static, Type } from '../typebox-openapi'

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

export const PrivilegeTypeDef = Type.StringLiteralUnion(['consumer', 'store_manager'], {
	$id: 'PrivilegeType'
})
export const PrivilegeTypeRef = Type.Ref(PrivilegeTypeDef)
export type PrivilegeType = Static<typeof PrivilegeTypeDef>

export const UserDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String(),
		privileges: Type.Array(PrivilegeTypeDef)
	},
	{ $id: 'User' }
)
export const UserRef = Type.Ref(UserDef)
export type UserType = Static<typeof UserDef>
