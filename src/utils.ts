export function randString(
	length: number,
	charset: string = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
) {
	let str = ''
	for (let i = 0; i < length; i++) {
		str += charset[Math.floor(Math.random() * charset.length)]
	}
	return str
}
