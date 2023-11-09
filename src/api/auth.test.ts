import '../app-test-setup'
import { expect, test, jest } from '@jest/globals'

jest.mock('../models/user')

test('POST /api/register', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		payload: {
			name: 'test',
			username: 'testuser',
			password: 'testpassword'
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({ message: 'User created' })
})
test('POST /api/register (bad username)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		payload: {
			name: 'test',
			username: 'test',
			password: 'testpassword'
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ message: 'Username must be at least 8 characters' })
})
test('POST /api/register (bad password)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		payload: {
			name: 'test',
			username: 'testuser',
			password: 'test'
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ message: 'Password must be at least 12 characters' })
})
test('POST /api/register (user exists)', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/register',
		payload: {
			name: 'test',
			username: 'testuser',
			password: 'testpassword'
		}
	})
	expect(response.statusCode).toBe(400)
	expect(response.json()).toEqual({ message: 'User already exists' })
})
test('POST /api/login', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/login',
		payload: {
			username: 'testuser',
			password: 'testpassword'
		}
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({ message: 'Login successful' })
})
