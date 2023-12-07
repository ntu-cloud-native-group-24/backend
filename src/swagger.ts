import { FastifyInstance } from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import {
	LoginUserDef,
	RegisterUserDef,
	StoreDef,
	StoreWithoutIdDef,
	StoreOpeningHoursDef,
	StoreOpeningHoursWithoutIdDef,
	StoreTagDef,
	StoreCategoryDef,
	PrivilegeTypeDef,
	UserDef,
	MealDef
} from './schema'

export async function initSwagger(app: FastifyInstance) {
	app.addSchema(LoginUserDef)
	app.addSchema(RegisterUserDef)
	app.addSchema(StoreDef)
	app.addSchema(StoreWithoutIdDef)
	app.addSchema(StoreOpeningHoursDef)
	app.addSchema(StoreOpeningHoursWithoutIdDef)
	app.addSchema(StoreTagDef)
	app.addSchema(StoreCategoryDef)
	app.addSchema(PrivilegeTypeDef)
	app.addSchema(UserDef)
	app.addSchema(MealDef)
	await app.register(fastifySwagger, {
		swagger: {
			info: {
				title: 'Test swagger',
				description: 'Testing the Fastify swagger API',
				version: '0.1.0'
			},
			externalDocs: {
				url: 'https://swagger.io',
				description: 'Find more info here'
			},
			// host: 'localhost',
			// schemes: ['http'],
			consumes: ['application/json'],
			produces: ['application/json'],
			tags: [
				{ name: 'auth', description: 'Authentication end-points' },
				{ name: 'misc', description: 'Miscellaneous end-points' },
				{ name: 'store', description: 'Store related end-points' },
				{ name: 'meal', description: 'Meal related end-points' },
				{ name: 'user', description: 'User related end-points' }
			],
			// definitions: {
			// 	User: {
			// 		type: 'object',
			// 		required: ['id', 'email'],
			// 		properties: {
			// 			id: { type: 'string', format: 'uuid' },
			// 			firstName: { type: 'string' },
			// 			lastName: { type: 'string' },
			// 			email: { type: 'string', format: 'email' }
			// 		}
			// 	}
			// },
			securityDefinitions: {
				apiKey: {
					type: 'apiKey',
					name: 'X-API-KEY',
					in: 'header'
				}
			}
		}
	})
	await app.register(fastifySwaggerUI, {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'none',
			deepLinking: false
		},
		staticCSP: false,
		transformSpecificationClone: true
	})
}
