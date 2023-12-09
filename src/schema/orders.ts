import { Static, Type } from '../typebox-openapi'
import { CustomizationsWithStatusRef } from './customizations'

export const OrderRequestItemDef = Type.Object(
	{
		meal_id: Type.Number(),
		quantity: Type.Number(),
		notes: Type.String(),
		customization_statuses: Type.Array(Type.Boolean())
	},
	{ $id: 'OrderRequestItem' }
)
export const OrderRequestItemRef = Type.Ref(OrderRequestItemDef)
export type OrderRequestItemType = Static<typeof OrderRequestItemDef>

export const OrderRequestDef = Type.Object(
	{
		items: Type.Array(OrderRequestItemRef),
		notes: Type.String(),
		payment_type: Type.StringLiteralUnion(['cash', 'credit_card', 'monthly']),
		delivery_method: Type.StringLiteralUnion(['delivery', 'pickup'])
	},
	{ $id: 'OrderRequest' }
)
export const OrderRequestRef = Type.Ref(OrderRequestDef)
export type OrderRequestType = Static<typeof OrderRequestDef>

export const OrderDetailDef = Type.Object(
	{
		id: Type.Number(),
		order_id: Type.Number(),
		meal_id: Type.Number(),
		quantity: Type.Number(),
		notes: Type.String(),
		customizations: CustomizationsWithStatusRef,
		calculated_price_per_item: Type.Number()
	},
	{ $id: 'OrderDetail' }
)

export const OrderDef = Type.Object(
	{
		id: Type.Number(),
		user_id: Type.Number(),
		store_id: Type.Number(),
		notes: Type.String(),
		payment_type: Type.StringLiteralUnion(['cash', 'credit_card', 'monthly']),
		delivery_method: Type.StringLiteralUnion(['delivery', 'pickup']),
		state: Type.StringLiteralUnion(['paid', 'cancelled']),
		created_at: Type.String({ format: 'date-time' }),
		total_price: Type.Number(),
		details: Type.Array(OrderDetailDef)
	},
	{ $id: 'Order' }
)
export const OrderRef = Type.Ref(OrderDef)
export type OrderType = Static<typeof OrderDef>
