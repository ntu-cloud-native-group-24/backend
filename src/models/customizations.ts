import { CustomizationsType } from '../schema'

type SelectionItemWithData = {
	name: string
	price: number
	status: boolean
}

type SelectionGroupWithData = (
	| {
			type: 'radio'
			title: string
			items: SelectionItemWithData[]
	  }
	| {
			type: 'checkbox'
			title: string
			items: SelectionItemWithData[]
	  }
)[]

function fillSelectionGroupStatusInplace(customizations: CustomizationsType, statuses: boolean[]) {
	const numberOfItems = customizations.selectionGroups.reduce((acc, group) => acc + group.items.length, 0)
	if (statuses.length !== numberOfItems) {
		throw new Error('Invalid statuses')
	}
	const selectionGroups = customizations.selectionGroups as SelectionGroupWithData
	const ar = statuses.slice().reverse()
	for (const group of selectionGroups) {
		for (const item of group.items) {
			item.status = ar.pop()!
		}
	}
}

function validateGroupConstraints(groups: SelectionGroupWithData) {
	const radioGroups = groups.filter(group => group.type === 'radio')
	for (const group of radioGroups) {
		const selectedItems = group.items.filter(item => item.status)
		if (selectedItems.length !== 1) {
			return false
		}
	}
	return true
}

export function getSelectionGroupsWithData(customizations: CustomizationsType, statuses: boolean[]) {
	// (typeof customizations.selectionGroups) is a supertype of SelectionGroupWithData
	// so it is safe to cast
	const groups = customizations.selectionGroups as SelectionGroupWithData
	fillSelectionGroupStatusInplace(customizations, statuses)
	if (!validateGroupConstraints(groups)) {
		throw new Error('Invalid customizations')
	}
	return groups
}

export function calculatePriceOfSelectionGroupsWithData(groups: SelectionGroupWithData) {
	let price = 0
	for (const group of groups) {
		for (const item of group.items) {
			if (item.status) {
				price += item.price
			}
		}
	}
	return price
}

export function calculatePriceOfCustomizations(customizations: CustomizationsType, statuses: boolean[]) {
	const groups = getSelectionGroupsWithData(customizations, statuses)
	return calculatePriceOfSelectionGroupsWithData(groups)
}
