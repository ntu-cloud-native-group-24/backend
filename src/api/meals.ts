import { FastifyInstance } from 'fastify'
import {
	success,
	fail,
	wrapSuccessOrNotSchema,
	MealRef,
	MealType,
	MealWithoutIdRef,
	MealWithoutIdType
} from '../schema'
import { createMeal, modifyMeal, deleteMeal, getMealById, getAllMealsForStore } from '../models/meal'
import { storeManagerRequired } from './stores'
import { getStoreById } from '../models/store'

export default async function init(app: FastifyInstance) {
	app.get<{
		Params: { store_id: number }
	}>(
		'/store/:store_id/meals',
		{
			schema: {
				description: 'Get meals by store id',
				tags: ['store', 'meal'],
				summary: 'Get all the id and name of meals',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							meals: {
								type: 'array',
								items: MealRef
							}
						})
					}
				}
			}
		},
		async (req, reply) => {
			const { store_id } = req.params
			const store = await getStoreById(store_id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			reply.send(success({ meals: await getAllMealsForStore(store_id) }))
		}
	)
	app.get<{
		Params: { store_id: number; meal_id: number }
	}>(
		'/store/:store_id/meals/:meal_id',
		{
			schema: {
				description: 'Get meals by store id',
				tags: ['store', 'meal'],
				summary: 'Get all the id and name of meals',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							meal: MealRef
						})
					},
					404: {
						description: 'Store or meal not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				}
			}
		},
		async (req, reply) => {
			const { store_id, meal_id } = req.params
			const store = await getStoreById(store_id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			const meal = await getMealById(meal_id)
			if (!meal) {
				return reply.code(404).send(fail('Meal not found'))
			}
			reply.send(success({ meal }))
		}
	)
	app.post<{
		Params: { store_id: number }
		Body: MealWithoutIdType
	}>(
		'/store/:store_id/meals',
		{
			preHandler: storeManagerRequired,
			schema: {
				description: 'Create meal',
				tags: ['store', 'meal'],
				summary: 'Create meal',
				body: MealWithoutIdRef,
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							meal: MealRef
						})
					},
					404: {
						description: 'Store not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { store_id } = req.params
			const store = await getStoreById(store_id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			const meal = await createMeal({ ...req.body, store_id })
			reply.send(success({ meal }))
		}
	)
	app.put<{
		Params: { store_id: number; meal_id: number }
		Body: MealType
	}>(
		'/store/:store_id/meals/:meal_id',
		{
			preHandler: storeManagerRequired,
			schema: {
				description: 'Modify meal',
				tags: ['store', 'meal'],
				summary: 'Modify meal',
				body: MealRef,
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							meal: MealRef
						})
					},
					404: {
						description: 'Store or meal not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { store_id, meal_id } = req.params
			const store = await getStoreById(store_id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (!(await getMealById(meal_id))) {
				return reply.code(404).send(fail('Meal not found'))
			}
			const meal = await modifyMeal(meal_id, req.body)
			reply.send(success({ meal }))
		}
	)
	app.delete<{
		Params: { store_id: number; meal_id: number }
	}>(
		'/store/:store_id/meals/:meal_id',
		{
			preHandler: storeManagerRequired,
			schema: {
				description: 'Delete meal',
				tags: ['store', 'meal'],
				summary: 'Delete meal',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					404: {
						description: 'Store or meal not found',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { store_id, meal_id } = req.params
			const store = await getStoreById(store_id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (!(await getMealById(meal_id))) {
				return reply.code(404).send(fail('Meal not found'))
			}
			await deleteMeal(meal_id)
			reply.send(success({}))
		}
	)
}
