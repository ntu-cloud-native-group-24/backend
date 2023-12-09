import { db } from '../db'
import { OrderRequestType } from '../schema/orders'
import { CustomizationsType } from '../schema/customizations'
import { getSelectionGroupsWithData, calculatePriceOfSelectionGroupsWithData } from './customizations'

export async function createOrder(user_id: number, store_id: number, order: OrderRequestType) {
	const orderId = await db.transaction().execute(async tx => {
		if (order.items.length === 0) throw new Error('Order must not be empty')
		if (!order.items.every(item => item.quantity > 0)) throw new Error('Invalid quantity')
		const mealIds = order.items.map(item => item.meal_id)
		const mealData = await tx
			.selectFrom('meals')
			.where('id', 'in', mealIds)
			.where('store_id', '=', store_id)
			.select(['price', 'customizations'])
			.execute()
		if (mealData.length !== mealIds.length) throw new Error('Invalid meal ids')
		const orderResp = await tx
			.insertInto('orders')
			.values({
				user_id,
				store_id,
				notes: order.notes,
				payment_type: order.payment_type,
				delivery_method: order.delivery_method,
				state: 'paid' // we don't have a payment system yet
			})
			.returningAll()
			.executeTakeFirstOrThrow()
		const newItems = order.items.map((item, index) => ({
			...item,
			selection_groups: getSelectionGroupsWithData(
				mealData[index].customizations as CustomizationsType,
				item.customization_statuses
			),
			price: mealData[index].price
		}))
		const insertValues = newItems.map((item, index) => ({
			order_id: orderResp.id,
			meal_id: item.meal_id,
			quantity: item.quantity,
			notes: item.notes,
			customizations: JSON.stringify({
				selectionGroups: item.selection_groups
			}),
			calculated_price_per_item: item.price + calculatePriceOfSelectionGroupsWithData(item.selection_groups)
		}))
		await tx.insertInto('order_details').values(insertValues).execute()
		return orderResp.id
	})
	return orderId
}

export async function getOrder(order_id: number) {
	const order = await db.selectFrom('orders').where('id', '=', order_id).selectAll().executeTakeFirst()
	if (!order) return
	const details = await db.selectFrom('order_details').where('order_id', '=', order_id).selectAll().execute()
	const total_price = details.reduce((acc, detail) => acc + detail.calculated_price_per_item * detail.quantity, 0)
	return {
		...order,
		details,
		total_price
	}
}
