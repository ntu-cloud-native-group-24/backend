import { randString } from '../utils'

export async function createUserOfPrivilege(app: any, privilege: string) {
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
