import { UICustomizationsType, SelectionGroupType } from '../schema'

export function validateUICustomizationsOrThrow(customizations: UICustomizationsType) {
	const allDisabledGroups = customizations.selectionGroups.some(group => group.items.every(item => !item.enabled))
	if (allDisabledGroups) {
		throw new Error('Each selection group must have at least one enabled item')
	}
}

function validateGroupConstraintsOrThrow(groups: SelectionGroupType[]) {
	const radioGroups = groups.filter(group => group.type === 'radio')
	for (const group of radioGroups) {
		const selectedItems = group.items.filter(item => item.selected)
		if (selectedItems.length !== 1) {
			throw new Error('Each radio selection group must have exactly one selected item')
		}
	}
}

export function getSelectionGroupsWithData(customizations: UICustomizationsType, selections: boolean[]) {
	const totLen = customizations.selectionGroups.reduce((acc, group) => acc + group.items.length, 0)
	if (selections.length !== totLen) {
		throw new Error('Selections array length does not match the number of items in the customizations')
	}
	const groups: SelectionGroupType[] = []
	const ar = selections.slice().reverse()
	for (const group of customizations.selectionGroups) {
		const items = []
		for (const item of group.items) {
			const selected = ar.pop()!
			if (!item.enabled && selected) {
				throw new Error("Can't select a disabled item")
			}
			items.push({
				name: item.name,
				price: item.price,
				selected
			})
		}
		groups.push({
			type: group.type,
			title: group.title,
			items
		})
	}
	validateGroupConstraintsOrThrow(groups)
	return groups
}

export function calculatePriceOfSelectionGroupsWithData(groups: SelectionGroupType[]) {
	let price = 0
	for (const group of groups) {
		for (const item of group.items) {
			if (item.selected) {
				price += item.price
			}
		}
	}
	return price
}

export function calculatePriceOfCustomizations(customizations: UICustomizationsType, selections: boolean[]) {
	const groups = getSelectionGroupsWithData(customizations, selections)
	return calculatePriceOfSelectionGroupsWithData(groups)
}
