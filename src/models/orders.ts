import { db } from '../db'
import { OrderRequestType } from '../schema/orders'
import { UICustomizationsType } from '../schema/customizations'
import { getSelectionGroupsWithData, calculatePriceOfSelectionGroupsWithData } from './customizations'
import { DeliveryMethod, OrderState, PaymentType, PrivilegeType } from '../db/types'
import { checkUserPrivilege } from './privileges'

export async function createOrder(user_id: number, store_id: number, order: OrderRequestType) {
	const orderId = await db.transaction().execute(async tx => {
		if (order.items.length === 0) throw new Error('Order must not be empty')
		if (!order.items.every(item => item.quantity > 0)) throw new Error('Invalid quantity')
		const mealIds = order.items.map(item => item.meal_id)
		const mealData = await tx
			.selectFrom('meals')
			.where('id', 'in', mealIds)
			.where('store_id', '=', store_id)
			.where('is_available', '=', true)
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
				state: 'pending', // we don't have a payment system yet
				calculated_total_price: -1
			})
			.returningAll()
			.executeTakeFirstOrThrow()
		const newItems = order.items.map((item, index) => ({
			...item,
			selection_groups: getSelectionGroupsWithData(
				mealData[index].customizations as UICustomizationsType,
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
		const totalPrice = insertValues.reduce((acc, item) => acc + item.calculated_price_per_item * item.quantity, 0)
		await tx
			.updateTable('orders')
			.set({
				calculated_total_price: totalPrice
			})
			.where('id', '=', orderResp.id)
			.execute()
		return orderResp.id
	})
	return orderId
}

export async function getOrderWithDetails(order_id: number) {
	const order = await db.selectFrom('orders').where('id', '=', order_id).selectAll().executeTakeFirst()
	if (!order) return
	const details = await db.selectFrom('order_details').where('order_id', '=', order_id).selectAll().execute()
	return {
		...order,
		details
	}
}

export async function checkedGetOrderWithDetails(user_id: number, order_id: number) {
	// only the user who created the order or the store owner can access the order
	const order = await getOrderWithDetails(order_id)
	if (!order) return
	if (order.user_id === user_id) return order
	const store = await db
		.selectFrom('stores')
		.where('owner_id', '=', user_id)
		.where('id', '=', order.store_id)
		.selectAll()
		.executeTakeFirst()
	if (store) return order
}

export async function getOrdersByUser(user_id: number) {
	const orders = await db
		.selectFrom('orders')
		.where('user_id', '=', user_id)
		.orderBy('created_at', 'desc')
		.selectAll()
		.execute()
	return orders
}

export async function getOrdersByStore(store_id: number) {
	const orders = await db
		.selectFrom('orders')
		.where('store_id', '=', store_id)
		.orderBy('created_at', 'desc')
		.selectAll()
		.execute()
	return orders
}

export async function getCompletedOrdersByStoreAndTime(store_id: number, begin: Date, end: Date) {
	const orders = await db
		.selectFrom('orders')
		.where('store_id', '=', store_id)
		.where('state', '=', 'completed')
		.where('created_at', '>=', begin)
		.where('created_at', '<', end)
		.orderBy('created_at', 'asc')
		.selectAll()
		.execute()
	return orders
}

type OrderStateTransitionTable = Record<OrderState, OrderState[]>
const VALID_STATE_TRANSITIONS_FOR_STORE_MANAGER: OrderStateTransitionTable = {
	pending: ['preparing', 'cancelled'],
	preparing: ['prepared', 'cancelled'],
	prepared: [],
	completed: [],
	cancelled: []
}
const VALID_STATE_TRANSITIONS_FOR_CONSUMER: OrderStateTransitionTable = {
	pending: ['cancelled'],
	preparing: [],
	prepared: ['completed'],
	completed: [],
	cancelled: []
}
const VALID_STATE_TRANSITIONS: Record<PrivilegeType, OrderStateTransitionTable> = {
	consumer: VALID_STATE_TRANSITIONS_FOR_CONSUMER,
	store_manager: VALID_STATE_TRANSITIONS_FOR_STORE_MANAGER
}

export async function updateOrderStateOrThrow(user_id: number, order_id: number, newState: OrderState) {
	const { state } = await db.selectFrom('orders').where('id', '=', order_id).select('state').executeTakeFirstOrThrow()
	for (const privilege of ['consumer', 'store_manager'] as const) {
		if (await checkUserPrivilege(user_id, privilege)) {
			if (!VALID_STATE_TRANSITIONS[privilege][state].includes(newState)) {
				throw new Error('Invalid state transition')
			}
			break
		}
	}
	await db
		.updateTable('orders')
		.set({
			state: newState
		})
		.where('id', '=', order_id)
		.execute()
}
