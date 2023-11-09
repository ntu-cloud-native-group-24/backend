import { hash, verify } from './password'
import { randomBytes } from 'crypto'
import { expect, test } from '@jest/globals'

test('hash', async () => {
	const password = randomBytes(16).toString('base64')
	const hashed = await hash(password)
	expect(await verify(password, hashed)).toBe(true)
})
