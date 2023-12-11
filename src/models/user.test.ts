import { test, expect } from '@jest/globals'
import {
	createUser,
	findUserLogin,
	validateUser,
	getUserIdByUsername,
	validateUserAndIssueToken,
	validateTokenAndGetUserId,
	getUserByIdOrThrow,
	validateTokenAndGetUser
} from './user'
import { randString } from '../utils'

const username = randString(8)
const password = randString(12)

test('Create user', async () => {
	const success = await createUser({
		name: 'test',
		email: 'user@example.com',
		username,
		password,
		privilege: 'store_manager'
	})
	expect(success).toBe(true)
})
test('Login', async () => {
	const success = await validateUser(username, password)
	expect(success).toBe(true)
})
test('Find user login', async () => {
	const userLogin = await findUserLogin(username)
	expect(userLogin).toEqual({
		password: expect.any(String)
	})
})
test('Get user id by username', async () => {
	const id = await getUserIdByUsername(username)
	expect(id).toEqual(expect.any(Number))
})
test('Validate user and issue token', async () => {
	const token = await validateUserAndIssueToken(username, password)
	expect(token).toEqual(expect.any(String))
})
test('User id from token is same as the id from username', async () => {
	const token = await validateUserAndIssueToken(username, password)
	expect(token).toEqual(expect.any(String))
	const id = await validateTokenAndGetUserId(token!)
	const id2 = await getUserIdByUsername(username)
	expect(id).toEqual(id2)
})
test('Get user by id or throw', async () => {
	const id = await getUserIdByUsername(username)
	const user = await getUserByIdOrThrow(id!)
	expect(user).toEqual({
		id: expect.any(Number),
		name: 'test',
		privileges: ['store_manager']
	})

	expect(getUserByIdOrThrow(0)).rejects.toThrow()
})
test('Validate token and get user', async () => {
	const token = await validateUserAndIssueToken(username, password)
	expect(token).toEqual(expect.any(String))
	const user = await validateTokenAndGetUser(token!)
	expect(user).toEqual({
		id: expect.any(Number),
		name: 'test',
		privileges: ['store_manager']
	})
})
