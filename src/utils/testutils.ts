import { FastifyInstance } from 'fastify'
import { randString } from '../utils'
import { createUser, getUserIdByUsername } from '../models/user'
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
