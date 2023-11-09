import { createFastify, FastifyInstanceType } from './app'
import { beforeAll, afterAll } from '@jest/globals'

declare global {
	var app: FastifyInstanceType
}
beforeAll(async () => {
	global.app = await createFastify(false)
})
afterAll(async () => {
	await global.app.close()
})
