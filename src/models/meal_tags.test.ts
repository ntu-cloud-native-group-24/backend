import { getAllMealTags } from './meal_tags'
import { expect, test, describe, beforeAll, jest } from '@jest/globals'

test('Get meal tags', async () => {
	const tags = await getAllMealTags()
	for (const tagobj of tags) {
		expect(tagobj).toMatchObject({
			id: expect.any(Number),
			name: expect.any(String)
		})
	}
})
