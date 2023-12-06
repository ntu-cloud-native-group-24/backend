import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'

test('Get tags', async () => {
	const response = await app.inject({
		method: 'GET',
		url: '/api/tags'
	})
	expect(response.statusCode).toBe(200)
	expect(response.json()).toMatchObject({
		success: true,
		tags: expect.any(Array)
	})
	for (const tagobj of response.json().tags) {
		expect(tagobj).toMatchObject({
			id: expect.any(Number),
			name: expect.any(String)
		})
	}
})