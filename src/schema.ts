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
export const StoreRef = Type.Ref(StoreDef)
export type StoreType = Static<typeof StoreDef>

export const StoreWithoutIdDef = Type.Omit(StoreDef, ['id'], {
	$id: 'StoreWithoutId'
})
export const StoreWithoutIdRef = Type.Ref(StoreWithoutIdDef)
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
export const UserRef = Type.Ref(UserDef)
export type UserType = Static<typeof UserDef>

export const FoodSelectionItemDef = Type.Object(
	{
		name: Type.String(),
		price: Type.Number(),
		status: Type.Boolean()
	},
	{ $id: 'FoodSelectionItem' }
)
export const FoodSelectionItemRef = Type.Ref(FoodSelectionItemDef)
export type FoodSelectionItemType = Static<typeof FoodSelectionItemDef>

export const FoodRadioSelectionGroupDef = Type.Object(
	{
		type: Type.Literal('radio'),
		title: Type.String(),
		items: Type.Array(FoodSelectionItemRef)
	},
	{ $id: 'FoodRadioSelectionGroup' }
)
export const FoodRadioSelectionGroupRef = Type.Ref(FoodRadioSelectionGroupDef)
export type FoodRadioSelectionGroupType = Static<typeof FoodRadioSelectionGroupDef>

export const FoodCheckboxSelectionGroupDef = Type.Object(
	{
		type: Type.Literal('checkbox'),
		title: Type.String(),
		items: Type.Array(FoodSelectionItemRef)
	},
	{ $id: 'FoodCheckboxSelectionGroup' }
)
export const FoodCheckboxSelectionGroupRef = Type.Ref(FoodCheckboxSelectionGroupDef)
export type FoodCheckboxSelectionGroupType = Static<typeof FoodCheckboxSelectionGroupDef>

export const FoodSelectionGroupDef = Type.Union([FoodRadioSelectionGroupRef, FoodCheckboxSelectionGroupRef], {
	$id: 'FoodSelectionGroup'
})
export const FoodSelectionGroupRef = Type.Ref(FoodSelectionGroupDef)
export type FoodSelectionGroupType = Static<typeof FoodSelectionGroupDef>

export const CustomizationsDef = Type.Object(
	{
		selectionGroups: Type.Array(FoodSelectionGroupRef)
	},
	{ $id: 'Customizations' }
)
export const CustomizationsRef = Type.Ref(CustomizationsDef)
export type CustomizationsType = Static<typeof CustomizationsDef>

export const MealDef = Type.Object(
	{
		id: Type.Number(),
		name: Type.String(),
		description: Type.String(),
		price: Type.Number(),
		picture: Type.String(),
		is_available: Type.Boolean(),
		customizations: CustomizationsRef
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
