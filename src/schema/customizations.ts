import { Static, Type } from '../typebox-openapi'

// describing the UI

export const UISelectionItemDef = Type.Object(
	{
		name: Type.String(),
		price: Type.Number(),
		enabled: Type.Boolean()
	},
	{ $id: 'UISelectionItem' }
)
export const UISelectionItemRef = Type.Ref(UISelectionItemDef)
export type UISelectionItemType = Static<typeof UISelectionItemDef>

export const UIRadioSelectionGroupDef = Type.Object(
	{
		type: Type.Literal('radio'),
		title: Type.String(),
		items: Type.Array(UISelectionItemRef)
	},
	{ $id: 'UIRadioSelectionGroup' }
)
export const UIRadioSelectionGroupRef = Type.Ref(UIRadioSelectionGroupDef)
export type UIRadioSelectionGroupType = Static<typeof UIRadioSelectionGroupDef>

export const UICheckboxSelectionGroupDef = Type.Object(
	{
		type: Type.Literal('checkbox'),
		title: Type.String(),
		items: Type.Array(UISelectionItemRef)
	},
	{ $id: 'UICheckboxSelectionGroup' }
)
export const UICheckboxSelectionGroupRef = Type.Ref(UICheckboxSelectionGroupDef)
export type UICheckboxSelectionGroupType = Static<typeof UICheckboxSelectionGroupDef>

export const UISelectionGroupDef = Type.Union([UIRadioSelectionGroupRef, UICheckboxSelectionGroupRef], {
	$id: 'UISelectionGroup'
})
export const UISelectionGroupRef = Type.Ref(UISelectionGroupDef)
export type UISelectionGroupType = Static<typeof UISelectionGroupDef>

export const UICustomizationsDef = Type.Object(
	{
		selectionGroups: Type.Array(UISelectionGroupRef)
	},
	{ $id: 'UICustomizations' }
)
export const UICustomizationsRef = Type.Ref(UICustomizationsDef)
export type UICustomizationsType = Static<typeof UICustomizationsDef>

// describing the data in order details

export const SelectionItemDef = Type.Object(
	{
		name: Type.String(),
		price: Type.Number(),
		selected: Type.Boolean()
	},
	{ $id: 'SelectionItem' }
)
export const SelectionItemRef = Type.Ref(SelectionItemDef)
export type SelectionItemType = Static<typeof SelectionItemDef>

export const RadioSelectionGroupDef = Type.Object(
	{
		type: Type.Literal('radio'),
		title: Type.String(),
		items: Type.Array(SelectionItemRef)
	},
	{ $id: 'RadioSelectionGroup' }
)
export const RadioSelectionGroupRef = Type.Ref(RadioSelectionGroupDef)
export type RadioSelectionGroupType = Static<typeof RadioSelectionGroupDef>

export const CheckboxSelectionGroupDef = Type.Object(
	{
		type: Type.Literal('checkbox'),
		title: Type.String(),
		items: Type.Array(SelectionItemRef)
	},
	{ $id: 'CheckboxSelectionGroup' }
)
export const CheckboxSelectionGroupRef = Type.Ref(CheckboxSelectionGroupDef)
export type FoodCheckboxSelectionGroupType = Static<typeof CheckboxSelectionGroupDef>

export const SelectionGroupDef = Type.Union([RadioSelectionGroupRef, CheckboxSelectionGroupRef], {
	$id: 'SelectionGroup'
})
export const SelectionGroupRef = Type.Ref(SelectionGroupDef)
export type SelectionGroupType = Static<typeof SelectionGroupDef>

export const CustomizationsDef = Type.Object(
	{
		selectionGroups: Type.Array(SelectionGroupRef)
	},
	{ $id: 'Customizations' }
)
export const CustomizationsRef = Type.Ref(CustomizationsDef)
export type CustomizationsType = Static<typeof CustomizationsDef>
