import { db } from '../db'
import { PrivilegeType } from '../db/types'
import { hash, verify } from '../utils/password'

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
