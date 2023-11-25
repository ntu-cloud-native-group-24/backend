import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import {
	wrapSuccessOrNotSchema,
	RegisterUserRef,
	RegisterUserType,
	LoginUserRef,
	LoginUserType,
	UserDef,
	UserType,
	PrivilegeTypeRef,
	PrivilegeType
} from '../schema'
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
			reply.code(401).send({ success: false, message: 'Unauthorized' })
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
			const { name, username, password } = req.body
			if (username.length < 8) {
				reply.code(400).send({ success: false, message: 'Username must be at least 8 characters' })
				return
			}
			if (password.length < 12) {
				reply.code(400).send({ success: false, message: 'Password must be at least 12 characters' })
				return
			}
			const found = !!(await User.findUserLogin(username))
			if (found) {
				reply.code(400).send({ success: false, message: 'User already exists' })
				return
			}
			const success = await User.createUser({
				name,
				username,
				password,
				privilege
			})
			if (!success) {
				reply.code(400).send({ success: false, message: 'User creation failed' })
				return
			}
			reply.send({ success: true, message: 'User created' })
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
				reply.code(400).send({ success: false, message: 'Invalid user or password' })
				return
			}
			reply.send({ success: true, message: 'Login successful', token })
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
					200: UserDef
				},
				security: [
					{
						apiKey: []
					}
				]
			}
		},
		async (req, reply) => {
			reply.send(req.user)
		}
	)
}
