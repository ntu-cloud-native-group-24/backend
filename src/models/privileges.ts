import { db } from '../db'
import { PrivilegeType } from '../db/types'

export async function checkUserPrivilege(user_id: number, privilege: PrivilegeType) {
	const exist = await db
		.selectFrom('user_privileges')
		.where('user_id', '=', user_id)
		.where('privilege', '=', privilege)
		.executeTakeFirst()
	return !!exist
}
