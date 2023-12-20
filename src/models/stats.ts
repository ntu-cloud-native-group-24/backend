import { db } from '../db'

export async function getMealSalesCount(meal_ids: number[]) {
	const res = await db
		.selectFrom('orders')
		.innerJoin('order_details', 'order_details.order_id', 'orders.id')
		.where('orders.state', '=', 'completed')
		.where('order_details.meal_id', 'in', meal_ids)
		.groupBy('meal_id')
		.select(({ fn, val, ref }) => ['meal_id', fn.sum<string>('quantity').as('count')])
		.execute()
	return res.map(x => ({
		meal_id: x.meal_id,
		count: Number(x.count)
	}))
}
