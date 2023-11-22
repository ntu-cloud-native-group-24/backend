import { db } from '../db'
import { PrivilegeType } from '../db/types'
import { hash, verify } from '../utils/password'
import { redis } from '../redis'
import * as crypto from 'crypto'

export const REDIS_TOKEN_PREFIX = 'token:'
export const REDIS_TOKEN_EXPIRY = 60 * 60 * 24 * 7 // 1 week

export async function createUser({
	name,
	username,
	password,
	privilege
}: {
	name: string
	username: string
	password: string
	privilege: PrivilegeType
}) {
	const hashedPassword = await hash(password)
	const user = await db.transaction().execute(async tx => {
		const user = await tx
			.insertInto('users')
			.values({ name, login_type: 'regular' })
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
export async function validateUserAndIssueToken(username: string, password: string) {
	if (!(await validateUser(username, password))) return
	const token = crypto.getRandomValues(Buffer.alloc(16)).toString('hex')
	const { id } = await db
		.selectFrom('users')
		.leftJoin('user_login', 'users.id', 'user_login.user_id')
		.where('username', '=', username)
		.select('users.id')
		.executeTakeFirstOrThrow()
	await redis.setex(REDIS_TOKEN_PREFIX + token, REDIS_TOKEN_EXPIRY, id.toString())
	return token
}
