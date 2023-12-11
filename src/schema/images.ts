import { Static, Type } from '../typebox-openapi'

export const UploadRequestDef = Type.Object(
	{
		type: Type.StringLiteralUnion(['image/png', 'image/jpeg']),
		prefix: Type.String() // 'restaurant' or 'meal' or whatever
	},
	{
		$id: 'UploadRequest'
	}
)
export const UploadRequestRef = Type.Ref(UploadRequestDef)
export type UploadRequestType = Static<typeof UploadRequestDef>

export const UploadResponseDef = Type.Object(
	{
		sas: Type.String(),
		url: Type.String()
	},
	{
		$id: 'UploadResponse'
	}
)
export const UploadResponseRef = Type.Ref(UploadResponseDef)
export type UploadResponseType = Static<typeof UploadResponseDef>
