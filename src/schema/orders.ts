import { Static, Type } from '../typebox-openapi'

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
