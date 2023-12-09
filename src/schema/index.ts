export function wrapSuccessOrNotSchema<T>(obj: T) {
	return {
		success: { type: 'boolean' },
		message: { type: 'string', nullable: true },
		...obj
	}
}

type StrUnknown = { [k in string]: unknown }

export function wrapResponse<T extends StrUnknown>(obj: T, success: boolean, message?: string) {
	const ret: {
		success: boolean
		message?: string
	} & T = {
		success,
		...obj
	}
	if (message) {
		ret.message = message
	}
	return ret
}

export function success<T extends StrUnknown>(obj: T, message?: string) {
	return wrapResponse(obj, true, message)
}

export function fail<T extends StrUnknown>(message?: string, obj?: T) {
	return wrapResponse(obj ?? {}, false, message)
}

export * from './user'
export * from './store'
export * from './hours'
export * from './tags'
export * from './store_categories'
export * from './customizations'
export * from './meals'
export * from './orders'
