import { getAllTags } from './tags'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'

test('Get tags', async () => {
	const tags = await getAllTags()
	for (const tagobj of tags) {
		expect(tagobj).toMatchObject({
			id: expect.any(Number),
			name: expect.any(String)
		})
	}
})
