import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

export async function hash(password: string) {
	const salt = randomBytes(16)
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
	const buf = Buffer.concat([salt, derivedKey])
	return buf.toString('base64')
}

export async function verify(password: string, hash: string) {
	const buf = Buffer.from(hash, 'base64')
	const salt = buf.subarray(0, 16)
	const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer
	return timingSafeEqual(buf.subarray(16), derivedKey)
}
