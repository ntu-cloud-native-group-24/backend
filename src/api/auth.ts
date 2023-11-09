import { FastifyInstance } from 'fastify'
import { RegisterUserRef, RegisterUserType } from '../schema'
import { db } from '../db'

export default async function init(app: FastifyInstance) {
	app.post<{ Body: RegisterUserType }>(
		'/register',
		{
			schema: {
				body: RegisterUserRef,
				description: 'Register a new user',
				tags: ['auth'],
				summary: 'Register a new user',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: {
							message: { type: 'string' }
						}
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: {
							message: { type: 'string' }
						}
					}
				}
			}
		},
		async (req, reply) => {
			const { name, username, password } = req.body
			const found = !!(await db.selectFrom('user_data').where('username', '=', username).executeTakeFirst())
			if (found) {
				reply.code(400).send({ message: 'User already exists' })
				return
			}
			const user = await db.transaction().execute(async tx => {
				const user = await tx
					.insertInto('user')
					.values({ name, login_type: 'regular' })
					.returning('id')
					.executeTakeFirst()
				if (!user) throw new Error('User creation failed')
				await tx
					.insertInto('user_privilege')
					.values({
						user_id: user.id,
						privilege: 'consumer'
					})
					.executeTakeFirstOrThrow()
				return await tx
					.insertInto('user_data')
					.values({ login_id: user.id, username, password })
					.executeTakeFirstOrThrow()
			})
			if (!user) {
				reply.code(400).send({ message: 'User creation failed' })
				return
			}
			reply.send({ message: 'User created' })
		}
	)
}
