import { PrivilegeType } from '../../db/types'

const db = new Map<string, string>()
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
	db.set(username, password)
	return true
}
export async function findUserLogin(username: string) {
	return db.has(username) ? { password: db.get(username) } : undefined
}
export async function validateUser(username: string, password: string) {
	return db.get(username) === password
}
