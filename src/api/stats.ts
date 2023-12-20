import { FastifyInstance } from 'fastify'
import { getMealSalesCount } from '../models/stats'
import {
	success,
	wrapSuccessOrNotSchema,
	MealSalesCountQueryRef,
	MealSalesCountQueryType,
	MealSalesCountRef
} from '../schema'

export default async function init(app: FastifyInstance) {
	app.post<{
		Body: { meal_ids: MealSalesCountQueryType }
	}>(
		'/stats/meal/sales',
		{
			schema: {
				description: 'Get the sales count of meals',
				tags: ['stats', 'meal'],
				summary: 'Get the sales count of multiple meals',
				body: {
					type: 'object',
					required: ['meal_ids'],
					properties: {
						meal_ids: MealSalesCountQueryRef
					}
				},
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							results: {
								type: 'array',
								items: MealSalesCountRef
							}
						})
					}
				}
			}
		},
		/* istanbul ignore next */
		async (req, reply) => {
			const { meal_ids } = req.body
			const results = await getMealSalesCount(meal_ids)
			reply.send(success({ results }))
		}
	)
}
