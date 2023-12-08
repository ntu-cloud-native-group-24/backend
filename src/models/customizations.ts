import { CustomizationsType } from '../schema'

export function validateCustomizations(customizations: CustomizationsType) {
	const anyEmptyGroup = customizations.selectionGroups.some(group => group.items.length === 0)
	if (anyEmptyGroup) {
		return false
	}
	const radioGroups = customizations.selectionGroups.filter(group => group.type === 'radio')
	for (const group of radioGroups) {
		const selectedItems = group.items.filter(item => item.status)
		if (selectedItems.length !== 1) {
			return false
		}
	}
	return true
}

export function calculatePriceOfCustomizations(customizations: CustomizationsType) {
	if (!validateCustomizations(customizations)) {
		throw new Error('Invalid customizations')
	}
	let price = 0
	for (const group of customizations.selectionGroups) {
		for (const item of group.items) {
			if (item.status) {
				price += item.price
			}
		}
	}
	return price
}
