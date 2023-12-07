import { FastifyInstance } from 'fastify'
import { randString } from '../utils'
import { redis } from '../redis'
import { createUser, getUserIdByUsername, REDIS_TOKEN_PREFIX, REDIS_TOKEN_EXPIRY } from '../models/user'
import { createStore } from '../models/store'
import { PrivilegeType } from '../schema'

export async function createUserOfPrivilegeAndReturnToken(app: FastifyInstance, privilege: string) {
	const username = randString(8)
	const password = randString(12)
	await app.inject({
		method: 'POST',
		url: '/api/register',
		query: {
			privilege: privilege
		},
		payload: {
			name: 'test',
			username,
			password
		}
	})
	const response = await app.inject({
		method: 'POST',
		url: '/api/login',
		payload: {
			username,
			password
		}
	})
	return response.json().token
}

export async function createUserOfPrivilegeAndReturnUID(privilege: PrivilegeType) {
	const username = randString(8)
	const password = randString(12)
	await createUser({
		name: 'test',
		username,
		password,
		privilege
	})
	return getUserIdByUsername(username) as Promise<number>
}

export async function getTokenByUserId(id: number) {
	const token = crypto.getRandomValues(Buffer.alloc(16)).toString('hex')
	await redis.setex(REDIS_TOKEN_PREFIX + token, REDIS_TOKEN_EXPIRY, id.toString())
	return token
}

export async function createDummyStore() {
	const store_manager = await createUserOfPrivilegeAndReturnUID('store_manager')
	const store = await createStore({
		owner_id: store_manager,
		name: 'test',
		description: 'test',
		address: 'test',
		picture_url: 'test',
		status: false,
		phone: '35353535',
		email: 'peko@gmail.com'
	})
	return store!
}
