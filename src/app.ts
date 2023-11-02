import fastify from 'fastify'
import { initSwagger } from './swagger'
import { AddressInfo } from 'net'
import { initRoutes } from './routes'

async function createFastify() {
	const app = fastify({
		logger: true
	})
	await initSwagger(app)
	await initRoutes(app)
	await app.ready()
	return app
}

if (require.main === module) {
	createFastify().then(app => {
		app.listen(
			{
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
