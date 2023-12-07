import { Static, Type } from './typebox-openapi'

export function wrapSuccessOrNotSchema<T>(obj: T) {
	return {
		success: { type: 'boolean' },
		message: { type: 'string', nullable: true },
		...obj
	}
}

type StrUnknown = { [k in string]: unknown }

export function wrapResponse<T extends StrUnknown>(obj: T, success: boolean, message?: string) {
	const ret: {
		success: boolean
		message?: string
	} & T = {
		success,
		...obj
	}
	if (message) {
		ret.message = message
	}
	return ret
}

export function success<T extends StrUnknown>(obj: T, message?: string) {
	return wrapResponse(obj, true, message)
}

export function fail<T extends StrUnknown>(message?: string, obj?: T) {
	return wrapResponse(obj ?? {}, false, message)
}

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
export const StoreTypeRef = Type.Ref(StoreDef)
export type StoreType = Static<typeof StoreDef>

export const StoreWithoutIdDef = Type.Omit(StoreDef, ['id'], {
	$id: 'StoreWithoutId'
})
export const StoreWithoutIdTypeRef = Type.Ref(StoreWithoutIdDef)
export type StoreWithoutIdType = Static<typeof StoreWithoutIdDef>

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

export const StoreTagDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String()
	},
	{ $id: 'StoreTag' }
)
export const StoreTagRef = Type.Ref(StoreTagDef)
export type StoreTagType = Static<typeof StoreTagDef>

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
export const UserTypeRef = Type.Ref(UserDef)
export type UserType = Static<typeof UserDef>

export const MealDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String(),
		description: Type.String(),
		price: Type.Number(),
		picture: Type.String(),
		category: Type.String(),
		is_available: Type.Boolean(),
		customizations: Type.Object({})
	},
	{ $id: 'Meal' }
)
export const MealTypeRef = Type.Ref(MealDef)
export type MealType = Static<typeof MealDef>
