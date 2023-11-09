import { FastifyInstance } from 'fastify'
import { RegisterUserRef, RegisterUserType, LoginUserRef, LoginUserType } from '../schema'
import { db } from '../db'
import { hash, verify } from '../utils/password'

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
			const hashedPassword = await hash(password)
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
					.values({ login_id: user.id, username, password: hashedPassword })
					.executeTakeFirstOrThrow()
			})
			if (!user) {
				reply.code(400).send({ message: 'User creation failed' })
				return
			}
			reply.send({ message: 'User created' })
		}
	)

	app.post<{ Body: LoginUserType }>(
		'/login',
		{
			schema: {
				body: LoginUserRef,
				description: 'Login',
				tags: ['auth'],
				summary: 'Login',
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
			const { username, password } = req.body
			const user = await db
				.selectFrom('user_data')
				.select('password')
				.where('username', '=', username)
				.executeTakeFirst()
			if (!user) {
				reply.code(400).send({ message: 'Invalid user or password' })
				return
			}
			const valid = await verify(password, user.password)
			if (!valid) {
				reply.code(400).send({ message: 'Invalid user or password' })
				return
			}
			reply.send({ message: 'Login successful' })
		}
	)
}
