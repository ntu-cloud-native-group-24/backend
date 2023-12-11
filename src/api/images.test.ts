import '../app-test-setup'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'

test('can get an image upload url', async () => {
	const response = await app.inject({
		method: 'POST',
		url: '/api/images',
		payload: {
			type: 'image/png',
			prefix: 'restaurant'
		}
	})
	expect(response.json()).toMatchObject({
		success: true,
		upload: {
			sas: expect.any(String),
			url: expect.stringMatching(/restaurant-.*\.png$/)
		}
	})
})
