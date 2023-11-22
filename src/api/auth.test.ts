import '../app-test-setup'
import { expect, test, describe, jest } from '@jest/globals'

const username = Math.random()
	.toString(36)
	.slice(2, 2 + 8)
const password =
	Math.random()
		.toString(36)
		.slice(2, 2 + 6) +
	Math.random()
		.toString(36)
		.slice(2, 2 + 6)

test('Register', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		payload: {
			name: 'test',
			username,
			password
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({ message: 'User created' })
})
test('Register (bad username)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		payload: {
			name: 'test',
			username: 'test',
			password:
				Math.random()
					.toString(36)
					.slice(2, 2 + 6) +
				Math.random()
					.toString(36)
					.slice(2, 2 + 6)
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ message: 'Username must be at least 8 characters' })
})
test('Register (bad password)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		payload: {
			name: 'test',
			username: Math.random()
				.toString(36)
				.slice(2, 2 + 8),
			password: 'test'
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ message: 'Password must be at least 12 characters' })
})
test('Register (user exists)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		payload: {
			name: 'test',
			username,
			password
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ message: 'User already exists' })
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
		expect(obj).toMatchObject({ message: 'Login successful' })
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
			message: 'Success',
			user: {
				name: 'test'
			}
		})
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
	expect(response.json()).toMatchObject({ message: 'Unauthorized' })
})
