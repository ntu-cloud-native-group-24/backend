import { FastifyInstance } from 'fastify'
import { success, fail, wrapSuccessOrNotSchema, MealTypeRef, MealType } from '../schema'
import { getMealById } from '../models/meal'
export default async function init(app: FastifyInstance) {
	// app.get(
	// 	'/meal',
	// 	{
	// 		schema: {
	// 			description: 'Get all meals',
	// 			tags: ['meal'],
	// 			summary: 'Get all meals',
	// 			response: {
	// 				200: wrapSuccessOrNotSchema({
	// 					meals: { type: 'array', items: MealTypeRef }
	// 				})
	// 			},
	// 			security: [
	// 				{
	// 					apiKey: []
	// 				}
	// 			]
	// 		}
	// 	},
	// 	async (req, reply) => {
	// 		reply.send(
	// 			success({
	// 				meals: await getAllMeals()
	// 			})
	// 		)
	// 	}
	// )
	// app.get<{
	// 	Params: { id: number }
	// }>(
	// 	'/meal/:id',
	// 	{
	// 		schema: {
	// 			description: 'Get meal by id',
	// 			tags: ['meal'],
	// 			summary: 'Get meal by id',
	// 			params: {
	// 				type: 'object',
	// 				properties: {
	// 					id: { type: 'number' }
	// 				}
	// 			},
	// 			response: {
	// 				200: wrapSuccessOrNotSchema({
	// 					meal: MealTypeRef
	// 				}),
	// 				404: wrapSuccessOrNotSchema({})
	// 			},
	// 			security: [
	// 				{
	// 					apiKey: []
	// 				}
	// 			]
	// 		}
	// 	},
	// 	async (req, reply) => {
	// 		const { id } = req.params
	// 		const meal = await getMealById(id)
	// 		if (!meal) {
	// 			return reply.code(404).send(fail())
	// 		}
	// 		reply.send(success({ meal }))
	// 	}
	// )
}
