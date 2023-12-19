import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
	wrapSuccessOrNotSchema,
	success,
	fail,
	RegisterUserRef,
	RegisterUserType,
	LoginUserRef,
	LoginUserType,
	UserRef,
	UserType,
	PrivilegeTypeRef,
	PrivilegeType,
	OrderRef,
	StoreRef
} from '../schema'
import * as User from '../models/user'
import { getOrdersByUser } from '../models/orders'
import { getAllStores } from '../models/store'

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
			reply.code(401).send(fail('Unable to validate token'))
			return
		}
		req.user = user
	})
}

export async function loginRequired(request: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) {
	if (!request.user) {
		reply.code(401).send(fail('Unauthorized'))
		done(new Error('Unauthorized'))
		return
	}
}

export default async function init(app: FastifyInstance) {
	app.post<{
		Querystring: { privilege: PrivilegeType }
		Body: RegisterUserType
	}>(
		'/register',
		{
			schema: {
				body: RegisterUserRef,
				description: 'Register a new user',
				tags: ['auth'],
				summary: 'Register a new user',
				querystring: {
					type: 'object',
					properties: {
						privilege: PrivilegeTypeRef
					},
					required: ['privilege']
				},
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
					}
				}
			}
		},
		async (req, reply) => {
			const { privilege } = req.query
			const { name, email, username, password } = req.body
			if (username.length < 8) {
				reply.code(400).send(fail('Username must be at least 8 characters'))
				return
			}
			if (password.length < 12) {
				reply.code(400).send(fail('Password must be at least 12 characters'))
				return
			}
			const found = !!(await User.findUserLogin(username))
			if (found) {
				reply.code(400).send(fail('User already exists'))
				return
			}
			const good = await User.createUser({
				name,
				email,
				username,
				password,
				privilege
			})
			if (!good) {
				reply.code(400).send(fail('User creation failed'))
				return
			}
			req.log.info(`User ${name} successfully created`)
			reply.send(success({}, 'User created'))
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
						properties: wrapSuccessOrNotSchema({
							token: { type: 'string' }
						})
					},
					400: {
						description: 'Bad request',
						type: 'object',
						properties: wrapSuccessOrNotSchema({})
					}
				}
			}
		},
		async (req, reply) => {
			const { username, password } = req.body
			const token = await User.validateUserAndIssueToken(username, password)
			if (!token) {
				reply.code(400).send(fail('Invalid user or password'))
				return
			}
			req.log.info(`User ${username} successfully login`)
			reply.send(success({ token }, 'Login successful'))
		}
	)

	app.get(
		'/me',
		{
			preHandler: loginRequired,
			schema: {
				description: 'Get current user',
				tags: ['auth', 'user'],
				summary: 'Get current user',
				response: {
					200: wrapSuccessOrNotSchema({
						user: UserRef
					})
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			reply.send(
				success({
					user: req.user
				})
			)
		}
	)
	app.post<{
		Body: {
			name: string
			email: string
		}
	}>(
		'/me',
		{
			preHandler: loginRequired,
			schema: {
				description: 'Modify current user',
				tags: ['auth', 'user'],
				summary: 'Modify current user',
				params: {
					type: 'object',
					properties: {
						name: { type: 'string' },
						email: { type: 'string' }
					}
				},
				response: {
					200: wrapSuccessOrNotSchema({})
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const { name, email } = req.body
			await User.modifyUser({
				id: req.user.id,
				name,
				email
			})
			req.log.info(`User ${name} successfully modified`)
			reply.send(success({}, 'User modified'))
		}
	)
	app.post<{
		Body: {
			password: string
			password_old: string
		}
	}>(
		'/me/password',
		{
			preHandler: loginRequired,
			schema: {
				description: 'Change password',
				tags: ['auth', 'user'],
				summary: 'Change password',
				params: {
					type: 'object',
					properties: {
						password: { type: 'string' },
						password_old: { type: 'string' }
					}
				},
				response: {
					200: wrapSuccessOrNotSchema({}),
					400: wrapSuccessOrNotSchema({})
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			const good = await User.changePassword(req.user.id, req.body.password_old, req.body.password)
			if (good) {
				req.log.info(`User ${req.user.id} successfully changed password`)
				reply.send(success({}, 'Password changed'))
			} else {
				reply.code(400).send(fail('Invalid password'))
			}
		}
	)
}
