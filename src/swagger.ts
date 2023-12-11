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
	UISelectionItemDef,
	UIRadioSelectionGroupDef,
	UICheckboxSelectionGroupDef,
	UISelectionGroupDef,
	UICustomizationsDef,
	SelectionItemDef,
	RadioSelectionGroupDef,
	CheckboxSelectionGroupDef,
	SelectionGroupDef,
	CustomizationsDef,
	MealDef,
	MealWithoutIdDef,
	MealCategoryDef,
	OrderRequestItemDef,
	OrderRequestDef,
	OrderDetailDef,
	OrderStateDef,
	OrderDef,
	UploadRequestDef,
	UploadResponseDef
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
	app.addSchema(UISelectionItemDef)
	app.addSchema(UIRadioSelectionGroupDef)
	app.addSchema(UICheckboxSelectionGroupDef)
	app.addSchema(UISelectionGroupDef)
	app.addSchema(UICustomizationsDef)
	app.addSchema(SelectionItemDef)
	app.addSchema(RadioSelectionGroupDef)
	app.addSchema(CheckboxSelectionGroupDef)
	app.addSchema(SelectionGroupDef)
	app.addSchema(CustomizationsDef)
	app.addSchema(MealDef)
	app.addSchema(MealWithoutIdDef)
	app.addSchema(MealCategoryDef)
	app.addSchema(OrderRequestItemDef)
	app.addSchema(OrderRequestDef)
	app.addSchema(OrderDetailDef)
	app.addSchema(OrderStateDef)
	app.addSchema(OrderDef)
	app.addSchema(UploadRequestDef)
	app.addSchema(UploadResponseDef)
	await app.register(fastifySwagger, {
		swagger: {
			info: {
				title: 'Food backend API',
				description: 'Backend API for food ordering system',
				version: '0.1.0'
			},
			// host: 'localhost',
			// schemes: ['http'],
			consumes: ['application/json'],
			produces: ['application/json'],
			tags: [
				{ name: 'misc', description: 'Miscellaneous end-points' },
				{ name: 'auth', description: 'Authentication end-points' },
				{ name: 'user', description: 'User related end-points' },
				{ name: 'store', description: 'Store related end-points' },
				{ name: 'hours', description: 'Opening hours related end-points' },
				{ name: 'categories', description: 'Store meal categories related end-points' },
				{ name: 'meal', description: 'Meal related end-points' },
				{ name: 'tags', description: 'Meal tags related end-points' },
				{ name: 'order', description: 'Order related end-points' }
			],
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
