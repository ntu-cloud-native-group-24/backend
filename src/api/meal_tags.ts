import { FastifyInstance } from 'fastify'
import { getAllMealTags } from '../models/meal_tags'
import { success, fail, wrapSuccessOrNotSchema, MealTagRef } from '../schema'

export default async function init(app: FastifyInstance) {
	app.get(
		'/meal_tag',
		{
			schema: {
				description: 'Get meal tags',
				tags: ['meal_tag'],
				summary: 'Get all the id and name of meal tags',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							tags: {
								type: 'array',
								items: MealTagRef
							}
						})
					}
				}
			}
		},
		async (req, reply) => {
			reply.send(success({ tags: await getAllMealTags() }))
		}
	)
}
