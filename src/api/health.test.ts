import '../app-test-setup'
import { expect, test, describe, jest } from '@jest/globals'

test('Health Check', async () => {
	const response = await app.inject({
		method: 'GET',
		url: '/api/health/check'
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toEqual({ status: 'ok' })
})
