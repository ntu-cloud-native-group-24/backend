import { createFastify, FastifyInstanceType } from './app'
import { jest, beforeAll, afterAll } from '@jest/globals'

jest.mock('./azure/blob.ts')
jest.mock('./azure/mail.ts')

declare global {
	var app: FastifyInstanceType
}
beforeAll(async () => {
	global.app = await createFastify(false)
})
afterAll(async () => {
	await global.app.close()
})
