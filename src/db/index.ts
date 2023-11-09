import { DB } from './types'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

const dialect = new PostgresDialect({
	pool: new Pool({
		database: 'devdb',
		host: 'localhost',
		user: 'dev',
		password: 'dev',
		port: 5432,
		max: 10
	})
})

export const db = new Kysely<DB>({
	dialect
})
