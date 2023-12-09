import type { ColumnType } from 'kysely'

export type DeliveryMethod = 'delivery' | 'pickup'

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
	? ColumnType<S, I | undefined, U>
	: ColumnType<T, T | undefined, T>

export type Json = ColumnType<JsonValue, string, string>

export type JsonArray = JsonValue[]

export type JsonObject = {
	[K in string]?: JsonValue
}

export type JsonPrimitive = boolean | number | string | null

export type JsonValue = JsonArray | JsonObject | JsonPrimitive

export type LoginType = 'regular' | 'sso'

export type OrderState = 'aborted' | 'paid' | 'unpaid'

export type PaymentType = 'cash' | 'credit_card' | 'monthly'

export type PrivilegeType = 'consumer' | 'store_manager'

export type Timestamp = ColumnType<Date, Date | string, Date | string>

export interface MealCategoriesAssoc {
	category_id: number
	meal_id: number
}

export interface Meals {
	customizations: Json
	description: string | null
	id: Generated<number>
	is_available: Generated<boolean>
	name: string
	picture: string | null
	price: number
	store_id: number
}

export interface OrderDetails {
	calculated_price_per_item: number
	customizations: Json
	id: Generated<number>
	meal_id: number
	notes: string
	order_id: number
	quantity: number
}

export interface Orders {
	created_at: Generated<Timestamp>
	delivery_method: DeliveryMethod
	id: Generated<number>
	notes: string
	payment_type: PaymentType
	state: OrderState
	store_id: number
	user_id: number
}

export interface StoreMealCategories {
	id: Generated<number>
	name: string
	store_id: number
}

export interface Stores {
	address: string
	description: string
	email: string
	id: Generated<number>
	name: string
	owner_id: number
	phone: string
	picture_url: string
	status: Generated<boolean>
}

export interface StoresOpeningHours {
	close_time: string
	day: number
	id: Generated<number>
	open_time: string
	store_id: number
}

export interface StoreTags {
	id: Generated<number>
	name: string
}

export interface StoreTagsAssoc {
	store_id: number
	tag_id: number
}

export interface UserLogin {
	password: string
	user_id: number
	username: string
}

export interface UserPrivileges {
	privilege: PrivilegeType
	user_id: number
}

export interface Users {
	id: Generated<number>
	login_type: LoginType
	name: string
}

export interface DB {
	meal_categories_assoc: MealCategoriesAssoc
	meals: Meals
	order_details: OrderDetails
	orders: Orders
	store_meal_categories: StoreMealCategories
	store_tags: StoreTags
	store_tags_assoc: StoreTagsAssoc
	stores: Stores
	stores_opening_hours: StoresOpeningHours
	user_login: UserLogin
	user_privileges: UserPrivileges
	users: Users
}
