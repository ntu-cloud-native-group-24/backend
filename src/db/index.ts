import { DB } from './types'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'

const dialect = new PostgresDialect({
	pool: new Pool({
		connectionString: process.env.DATABASE_URL || 'postgres://dev:dev@localhost:5432/devdb',
		max: 10
	})
})

export const db = new Kysely<DB>({
	dialect
})
