import '../app-test-setup'
import { expect, test, describe, jest } from '@jest/globals'
import { randString } from '../utils'

const username = randString(8)
const password = randString(12)
const newPassword = randString(12)

test('Register', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		query: {
			privilege: 'consumer'
		},
		payload: {
			name: 'test',
			email: 'user@example.com',
			username,
			password
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({ success: true, message: 'User created' })
})
test('Register (wrong privilege)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		query: {
			privilege: 'peko'
		},
		payload: {
			name: 'test',
			username: randString(8),
			password: randString(12)
		}
	})
	expect(response.statusCode).toBe(400)
})
test('Register (bad username)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		query: {
			privilege: 'consumer'
		},
		payload: {
			name: 'test',
			email: 'user@example.com',
			username: 'test',
			password: randString(12)
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ success: false, message: 'Username must be at least 8 characters' })
})
test('Register (bad password)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		query: {
			privilege: 'consumer'
		},
		payload: {
			name: 'test',
			email: 'user@example.com',
			username: randString(8),
			password: 'test'
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ success: false, message: 'Password must be at least 12 characters' })
})
test('Register (user exists)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		query: {
			privilege: 'consumer'
		},
		payload: {
			name: 'test',
			email: 'user@example.com',
			username,
			password
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ success: false, message: 'User already exists' })
})
describe('Login and Auth', () => {
	let token: string
	test('Login', async () => {
		const loginResponse = await app.inject({
			method: 'POST',
			url: '/api/login',
			payload: {
				username,
				password
			}
		})
		expect(loginResponse.statusCode).toBe(200)
		const obj = loginResponse.json()
		expect(obj).toMatchObject({ success: true, message: 'Login successful' })
		expect(typeof obj.token).toBe('string')
		token = obj.token
	})
	test('Get me', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/me',
			headers: {
				'X-API-KEY': token
			}
		})
		expect(response.statusCode).toBe(200)
		expect(response.json()).toMatchObject({
			success: true,
			user: {
				name: 'test',
				id: expect.any(Number),
				privileges: ['consumer']
			}
		})
	})
	test('Change me', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/me',
			headers: {
				'X-API-KEY': token
			},
			payload: {
				name: 'peko',
				email: 'peko@gmail.com'
			}
		})
		expect(response.statusCode).toBe(200)
		expect(response.json()).toMatchObject({
			success: true
		})
		const response2 = await app.inject({
			method: 'GET',
			url: '/api/me',
			headers: {
				'X-API-KEY': token
			}
		})
		expect(response2.statusCode).toBe(200)
		expect(response2.json()).toMatchObject({
			success: true,
			user: {
				name: 'peko',
				email: 'peko@gmail.com',
				id: expect.any(Number),
				privileges: ['consumer']
			}
		})
	})
	test('Change password', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/me/password',
			headers: {
				'X-API-KEY': token
			},
			payload: {
				password: newPassword,
				password_old: password
			}
		})
		expect(response.statusCode).toBe(200)
		expect(response.json()).toMatchObject({
			success: true
		})
		const loginResponse = await app.inject({
			method: 'POST',
			url: '/api/login',
			payload: {
				username,
				password: newPassword
			}
		})
		expect(loginResponse.statusCode).toBe(200)
		const obj = loginResponse.json()
		expect(obj).toMatchObject({ success: true, message: 'Login successful' })
	})
})
test('Login (incorrect password)', async () => {
	const loginResponse = await app.inject({
		method: 'POST',
		url: '/api/login',
		payload: {
			username,
			password: 'wrongpassword'
		}
	})
	expect(loginResponse.statusCode).toBe(400)
	expect(loginResponse.json()).toMatchObject({ message: 'Invalid user or password' })
})

test('Get me (wrong token)', async () => {
	const response = await app.inject({
		method: 'GET',
		url: '/api/me',
		headers: {
			'X-API-KEY': 'peko'
		}
	})
	expect(response.statusCode).toBe(401)
	expect(response.json()).toMatchObject({ message: 'Unable to validate token' })
})
test('Unauthorized', async () => {
	const response = await app.inject({
		method: 'GET',
		url: '/api/me'
	})
	expect(response.statusCode).toBe(401)
	expect(response.json()).toMatchObject({ message: 'Unauthorized' })
})
