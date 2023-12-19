import './app-test-setup'
import { expect, test, describe, jest } from '@jest/globals'

test('CORS preflight work for any api', async () => {
	const response = await app.inject({
		method: 'OPTIONS',
		url: '/api/whatever'
	})
	expect(response.statusCode).toBe(200)
	expect(response.headers['access-control-allow-origin']).toBe('*')
	expect(response.headers['access-control-allow-headers']).toBe('*')
	expect(response.headers['access-control-allow-methods']).toBe('*')
})
