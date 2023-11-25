// https://github.com/sinclairzx81/typebox/issues/107
import * as TypeBox from '@sinclair/typebox'
export * from '@sinclair/typebox'

type IntoStringLiteralUnion<T> = { [K in keyof T]: T[K] extends string ? TypeBox.TLiteral<T[K]> : never }

export class OpenApiTypeBuilder extends TypeBox.JsonTypeBuilder {
	public Nullable<T extends TypeBox.TSchema>(schema: T): TypeBox.TUnion<[T, TypeBox.TNull]> {
		return { ...schema, nullable: true } as any
	}

	public StringLiteralUnion<T extends string[]>(
		values: [...T],
		options?: { $id: string }
	): TypeBox.TUnion<IntoStringLiteralUnion<T>> {
		const ret = {
			type: 'string',
			enum: values
		} as any
		if (options) {
			ret.$id = options.$id
		}
		return ret
	}
}

export const Type = new OpenApiTypeBuilder()
