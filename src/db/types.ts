import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = ColumnType<JsonValue, string, string>;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type LoginType = "regular" | "sso";

export type OrderState = "aborted" | "paid" | "unpaid";

export type PaymentType = "cash" | "credit_card" | "monthly";

export type PrivilegeType = "consumer" | "store_manager";

export interface Meals {
  category: string;
  customizations: Json | null;
  description: string | null;
  id: Generated<number>;
  is_available: Generated<boolean>;
  name: string;
  picture: string | null;
  price: number;
  store: number;
}

export interface MealTagAssociation {
  meal_id: number;
  tag_id: number;
}

export interface MealTags {
  id: Generated<number>;
  name: string;
}

export interface Order {
  created_at: string;
  delivery_method: string;
  id: Generated<number>;
  notes: string;
  payment_type: PaymentType;
  state: OrderState;
  user: number;
}

export interface OrderDetail {
  id: Generated<number>;
  meal: number;
  notes: string;
  number: number;
}

export interface OrderDetailAssociation {
  order_detail_id: number;
  order_id: number;
}

export interface StoreData {
  description: string | null;
  id: Generated<number>;
  name: string;
  owner_id: number;
}

export interface StoreTagAssociation {
  store_id: number;
  tag_id: number;
}

export interface StoreTags {
  id: Generated<number>;
  name: string;
}

export interface User {
  id: Generated<number>;
  login_type: LoginType;
  name: string;
}

export interface UserData {
  login_id: Generated<number>;
  password: string;
  username: string;
}

export interface UserPrivilege {
  privilege: PrivilegeType;
  user_id: number;
}

export interface DB {
  meal_tag_association: MealTagAssociation;
  meal_tags: MealTags;
  meals: Meals;
  order: Order;
  order_detail: OrderDetail;
  order_detail_association: OrderDetailAssociation;
  store_data: StoreData;
  store_tag_association: StoreTagAssociation;
  store_tags: StoreTags;
  user: User;
  user_data: UserData;
  user_privilege: UserPrivilege;
}
