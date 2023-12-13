import 'winston-daily-rotate-file'
const winston = require('winston');

const simplify = winston.format((info: { message: string|any; }) => {
	if (info.message.req) {
		let request = info.message.req
		info.message = `[${request.id} Request] ${request.method} ${request.url}; ${request.ip}`
	}
	if (info.message.res) {
		let request = info.message.res.request
		let response = info.message.res
		info.message = `[${request.id} Response] ${response.statusCode}`
	}
	return info
})

const simple_format = winston.format.combine(
	winston.format.timestamp({ format: 'HH:mm:ss' }),
	simplify(),
	winston.format.printf((info:{timestamp:string,level:string,message:string }) => {
		return `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`
	})
)

export const init = () => {
	winston.loggers.add('default', {
		level: 'info',
		levels: Object.assign({ fatal: 0, warn: 4, trace: 7 }, winston.config.syslog.levels),
		format: simple_format,
		transports: [
			new winston.transports.DailyRotateFile({
				filename: './logs/%DATE%.log',
				level: 'info'
			}),
			new winston.transports.File({
				filename: './logs/error.log',
				level: 'error'
			})
		]
	})

	var logger = winston.loggers.get('default')
	process.on('uncaughtException', function (err) {
		console.log('UncaughtException processing: %s', err)
	})
	logger.child = function () {
		return winston.loggers.get('default')
	}

	return logger
}
