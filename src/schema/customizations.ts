import { Static, Type } from '../typebox-openapi'

export const FoodSelectionItemDef = Type.Object(
	{
		name: Type.String(),
		price: Type.Number()
	},
	{ $id: 'FoodSelectionItem' }
)
export const FoodSelectionItemRef = Type.Ref(FoodSelectionItemDef)
export type FoodSelectionItemType = Static<typeof FoodSelectionItemDef>

export const FoodRadioSelectionGroupDef = Type.Object(
	{
		type: Type.Literal('radio'),
		title: Type.String(),
		items: Type.Array(FoodSelectionItemRef)
	},
	{ $id: 'FoodRadioSelectionGroup' }
)
export const FoodRadioSelectionGroupRef = Type.Ref(FoodRadioSelectionGroupDef)
export type FoodRadioSelectionGroupType = Static<typeof FoodRadioSelectionGroupDef>

export const FoodCheckboxSelectionGroupDef = Type.Object(
	{
		type: Type.Literal('checkbox'),
		title: Type.String(),
		items: Type.Array(FoodSelectionItemRef)
	},
	{ $id: 'FoodCheckboxSelectionGroup' }
)
export const FoodCheckboxSelectionGroupRef = Type.Ref(FoodCheckboxSelectionGroupDef)
export type FoodCheckboxSelectionGroupType = Static<typeof FoodCheckboxSelectionGroupDef>

export const FoodSelectionGroupDef = Type.Union([FoodRadioSelectionGroupRef, FoodCheckboxSelectionGroupRef], {
	$id: 'FoodSelectionGroup'
})
export const FoodSelectionGroupRef = Type.Ref(FoodSelectionGroupDef)
export type FoodSelectionGroupType = Static<typeof FoodSelectionGroupDef>

export const CustomizationsDef = Type.Object(
	{
		selectionGroups: Type.Array(FoodSelectionGroupRef)
	},
	{ $id: 'Customizations' }
)
export const CustomizationsRef = Type.Ref(CustomizationsDef)
export type CustomizationsType = Static<typeof CustomizationsDef>

// with status: boolean

Type.Intersect([FoodSelectionItemDef, Type.Object({ status: Type.Boolean() })])

export const FoodSelectionItemWithStatusDef = Type.Object(
	{
		name: Type.String(),
		price: Type.Number(),
		status: Type.Boolean()
	},
	{ $id: 'FoodSelectionItemWithStatus' }
)
export const FoodSelectionItemWithStatusRef = Type.Ref(FoodSelectionItemWithStatusDef)
export type FoodSelectionItemWithStatusType = Static<typeof FoodSelectionItemWithStatusDef>

export const FoodRadioSelectionGroupWithStatusDef = Type.Object(
	{
		type: Type.Literal('radio'),
		title: Type.String(),
		items: Type.Array(FoodSelectionItemWithStatusRef)
	},
	{ $id: 'FoodRadioSelectionGroupWithStatus' }
)
export const FoodRadioSelectionGroupWithStatusRef = Type.Ref(FoodRadioSelectionGroupWithStatusDef)
export type FoodRadioSelectionGroupWithStatusType = Static<typeof FoodRadioSelectionGroupWithStatusDef>

export const FoodCheckboxSelectionGroupWithStatusDef = Type.Object(
	{
		type: Type.Literal('checkbox'),
		title: Type.String(),
		items: Type.Array(FoodSelectionItemWithStatusRef)
	},
	{ $id: 'FoodCheckboxSelectionGroupWithStatus' }
)
export const FoodCheckboxSelectionGroupWithStatusRef = Type.Ref(FoodCheckboxSelectionGroupWithStatusDef)
export type FoodCheckboxSelectionGroupWithStatusType = Static<typeof FoodCheckboxSelectionGroupWithStatusDef>

export const FoodSelectionGroupWithStatusDef = Type.Union(
	[FoodRadioSelectionGroupWithStatusRef, FoodCheckboxSelectionGroupWithStatusRef],
	{ $id: 'FoodSelectionGroupWithStatus' }
)
export const FoodSelectionGroupWithStatusRef = Type.Ref(FoodSelectionGroupWithStatusDef)
export type FoodSelectionGroupWithStatusType = Static<typeof FoodSelectionGroupWithStatusDef>

export const CustomizationsWithStatusDef = Type.Object(
	{
		selectionGroups: Type.Array(FoodSelectionGroupWithStatusRef)
	},
	{ $id: 'CustomizationsWithStatus' }
)
export const CustomizationsWithStatusRef = Type.Ref(CustomizationsWithStatusDef)
export type CustomizationsWithStatusType = Static<typeof CustomizationsWithStatusDef>
