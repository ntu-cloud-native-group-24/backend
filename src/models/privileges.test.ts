import { test, expect, beforeAll, jest } from '@jest/globals'
import { checkUserPrivilege } from './privileges'
import { createUserOfPrivilegeAndReturnUID } from '../utils/testutils'

let consumer: number
let store_manager: number

beforeAll(async () => {
	consumer = await createUserOfPrivilegeAndReturnUID('consumer')
	store_manager = await createUserOfPrivilegeAndReturnUID('store_manager')
})

test('Check consumer privilege', async () => {
	expect(await checkUserPrivilege(consumer, 'consumer')).toBe(true)
	expect(await checkUserPrivilege(consumer, 'store_manager')).toBe(false)
})

test('Check store manager privilege', async () => {
	expect(await checkUserPrivilege(store_manager, 'consumer')).toBe(false)
	expect(await checkUserPrivilege(store_manager, 'store_manager')).toBe(true)
})
