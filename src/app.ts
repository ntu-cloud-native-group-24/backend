import fastify from 'fastify'
import { initSwagger } from './swagger'
import { AddressInfo } from 'net'
import { initRoutes } from './routes'
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'

export async function createFastify(logger: boolean) {
	const app = fastify({
		logger: logger
			? {
					level: 'info'
			  }
			: false
	}).withTypeProvider<TypeBoxTypeProvider>()
	await initSwagger(app)
	await initRoutes(app)
	await app.ready()
	return app
}
export type FastifyInstanceType = Awaited<ReturnType<typeof createFastify>>

/* istanbul ignore next */
if (require.main === module) {
	createFastify(true).then(app => {
		app.listen(
			{
				host: '0.0.0.0',
				port: 3000
			},
			err => {
				if (err) throw err
				const addr = <AddressInfo>app.server.address()
				console.log(`Server listening on ${addr.port}`)
			}
		)
	})
}
