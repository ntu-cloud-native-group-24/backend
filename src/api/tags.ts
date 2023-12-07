import { FastifyInstance } from 'fastify'
import { getAllTags } from '../models/tags'
import { success, fail, wrapSuccessOrNotSchema, StoreTagRef } from '../schema'
import { loginRequired } from './auth'
import { getStoreById } from '../models/store'
import { addTagToStore, removeTagFromStore, getTagsOfStore } from '../models/tags'

export default async function init(app: FastifyInstance) {
	app.get(
		'/tags',
		{
			schema: {
				description: 'Get store tagws',
				tags: ['tags'],
				summary: 'Get all the id and name of store tags',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							tags: {
								type: 'array',
								items: StoreTagRef
							}
						})
					}
				}
			}
		},
		async (req, reply) => {
			reply.send(success({ tags: await getAllTags() }))
		}
	)
	app.get<{
		Params: { id: number }
	}>(
		'/store/:id/tags',
		{
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Get store tags by id',
				tags: ['store'],
				summary: 'Get store tags by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({
							tags: { type: 'array', items: StoreTagRef }
						})
					},
					404: {
						description: 'Not found',
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
			const { id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			reply.send(success({ tags: await getTagsOfStore(id) }))
		}
	)
	app.post<{
		Params: { id: number }
		Body: { tag_id: number }
	}>(
		'/store/:id/tags',
		{
			preHandler: loginRequired,
			schema: {
				body: {
					type: 'object',
					properties: {
						tag_id: { type: 'number' }
					}
				},
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' }
					}
				},
				description: 'Add store tag by id',
				tags: ['store'],
				summary: 'Add store tag by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					404: {
						description: 'Not found',
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
			const { id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (store.owner_id !== req.user.id) {
				return reply.code(400).send(fail('You are not the owner of this store'))
			}
			const { tag_id } = req.body
			const res = await addTagToStore(id, tag_id)
			if (res) {
				reply.send(success({}))
			} else {
				reply.code(400).send(fail('Unable to add tag to store'))
			}
		}
	)
	app.delete<{
		Params: { id: number; tag_id: number }
	}>(
		'/store/:id/tags/:tag_id',
		{
			preHandler: loginRequired,
			schema: {
				params: {
					type: 'object',
					properties: {
						id: { type: 'number' },
						tag_id: { type: 'number' }
					}
				},
				description: 'Remove store tag by id',
				tags: ['store'],
				summary: 'Remove store tag by id',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					},
					404: {
						description: 'Not found',
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
			const { id, tag_id } = req.params
			const store = await getStoreById(id)
			if (!store) {
				return reply.code(404).send(fail('Store not found'))
			}
			if (store.owner_id !== req.user.id) {
				return reply.code(400).send(fail('You are not the owner of this store'))
			}
			const res = await removeTagFromStore(id, tag_id)
			if (res) {
				reply.send(success({}))
			} else {
				reply.code(400).send(fail('Unable to remove tag from store'))
			}
		}
	)
}
