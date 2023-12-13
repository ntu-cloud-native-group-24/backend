import { db } from '../db'
import { PrivilegeType } from '../db/types'
import { hash, verify } from '../utils/password'
import { redis } from '../redis'
import * as crypto from 'crypto'

export const REDIS_TOKEN_PREFIX = 'token:'
export const REDIS_TOKEN_EXPIRY = 60 * 60 * 24 * 7 // 1 week

export async function createUser({
	name,
	email,
	username,
	password,
	privilege
}: {
	name: string
	email: string
	username: string
	password: string
	privilege: PrivilegeType
}) {
	const hashedPassword = await hash(password)
	const user = await db.transaction().execute(async tx => {
		const user = await tx
			.insertInto('users')
			.values({ name, email, login_type: 'regular' })
			.returning('id')
			.executeTakeFirst()
		if (!user) throw new Error('User creation failed')
		await tx
			.insertInto('user_privileges')
			.values({
				user_id: user.id,
				privilege
			})
			.executeTakeFirstOrThrow()
		return await tx
			.insertInto('user_login')
			.values({ user_id: user.id, username, password: hashedPassword })
			.executeTakeFirstOrThrow()
	})
	return !!user
}
export async function findUserLogin(username: string) {
	return db.selectFrom('user_login').select('password').where('username', '=', username).executeTakeFirst()
}
export async function validateUser(username: string, password: string) {
	const userLogin = await findUserLogin(username)
	if (!userLogin) return false
	return await verify(password, userLogin.password)
}
export async function getUserIdByUsername(username: string) {
	const user = await db
		.selectFrom('users')
		.leftJoin('user_login', 'users.id', 'user_login.user_id')
		.where('username', '=', username)
		.select('users.id')
		.executeTakeFirst()
	if (!user) return
	return user.id
}
export async function validateUserAndIssueToken(username: string, password: string) {
	if (!(await validateUser(username, password))) return
	const token = crypto.getRandomValues(Buffer.alloc(16)).toString('hex')
	const id = await getUserIdByUsername(username)
	if (!id) return
	await redis.setex(REDIS_TOKEN_PREFIX + token, REDIS_TOKEN_EXPIRY, id.toString())
	return token
}
export async function validateTokenAndGetUserId(token: string) {
	const id = await redis.get(REDIS_TOKEN_PREFIX + token)
	if (!id) return
	return parseInt(id)
}
export async function getUserByIdOrThrow(id: number) {
	const res = await db
		.selectFrom('users')
		.innerJoin('user_privileges', 'users.id', 'user_privileges.user_id')
		.where('id', '=', id)
		.select(['id', 'name', 'email', 'privilege'])
		.execute()
	if (!res || res.length === 0) throw new Error('User not found')
	return {
		id: res[0].id,
		name: res[0].name,
		email: res[0].email,
		privileges: res.map(r => r.privilege)
	}
}
export async function validateTokenAndGetUser(token: string) {
	const id = await validateTokenAndGetUserId(token)
	if (!id) return
	return await getUserByIdOrThrow(id)
}
export async function changePassword(user_id: number, oldPassword: string, newPassword: string) {
	const userLogin = await db
		.selectFrom('user_login')
		.select('password')
		.where('user_id', '=', user_id)
		.executeTakeFirst()
	if (!userLogin) return false
	if (!(await verify(oldPassword, userLogin.password))) return false
	await db
		.updateTable('user_login')
		.set({
			password: await hash(newPassword)
		})
		.where('user_id', '=', user_id)
		.execute()
	return true
}
export async function modifyUser({ id, name, email }: { id: number; name: string; email: string }) {
	// other fields are not supposed to be modified normally
	const res = await db
		.updateTable('users')
		.set({ name, email })
		.where('id', '=', id)
		.returningAll()
		.executeTakeFirstOrThrow()
	return res
}
