import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { RegisterUserRef, RegisterUserType, LoginUserRef, LoginUserType, UserDef, UserType } from '../schema'
import * as User from '../models/user'

declare module 'fastify' {
	interface FastifyRequest {
		user: UserType
	}
}

export async function initAuthMiddleware(app: FastifyInstance) {
	app.decorateRequest('user', null)
	app.addHook('onRequest', async (req, reply) => {
		const token = req.headers['x-api-key']
		if (!token || typeof token !== 'string') {
			// simply skip authentication if no token is provided
			// whether authentication is required or not is determined by the route
			return
		}
		const user = await User.validateTokenAndGetUser(token)
		if (!user) {
			reply.code(401).send({ message: 'Unauthorized' })
			return
		}
		req.user = user
	})
}

export async function loginRequired(request: FastifyRequest, reply: FastifyReply) {
	if (!request.user) {
		reply.code(401).send({ message: 'Unauthorized' })
		return
	}
}

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
							message: { type: 'string' },
							token: { type: 'string' }
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
			if (username.length < 8) {
				reply.code(400).send({ message: 'Username must be at least 8 characters' })
				return
			}
			if (password.length < 12) {
				reply.code(400).send({ message: 'Password must be at least 12 characters' })
				return
			}
			const found = !!(await User.findUserLogin(username))
			if (found) {
				reply.code(400).send({ message: 'User already exists' })
				return
			}
			const success = await User.createUser({
				name,
				username,
				password,
				privilege: 'consumer'
			})
			if (!success) {
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
							message: { type: 'string' },
							token: { type: 'string' }
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
			const token = await User.validateUserAndIssueToken(username, password)
			if (!token) {
				reply.code(400).send({ message: 'Invalid user or password' })
				return
			}
			reply.send({ message: 'Login successful', token })
		}
	)

	app.get(
		'/me',
		{
			preHandler: loginRequired,
			schema: {
				description: 'Get current user',
				tags: ['auth'],
				summary: 'Get current user',
				response: {
					200: {
						description: 'Successful response',
						type: 'object',
						properties: {
							message: { type: 'string' },
							user: UserDef
						}
					},
					401: {
						description: 'Unauthorized',
						type: 'object',
						properties: {
							message: { type: 'string' }
						}
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
			reply.send({ message: 'Success', user: req.user })
		}
	)
}
