import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { validateUICustomizationsOrThrow, calculatePriceOfCustomizations } from './customizations'

const radioGroup1 = {
	type: 'radio' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10,
			enabled: true
		},
		{
			name: 'item2',
			price: 20,
			enabled: true
		}
	]
}
const checkboxGroup1 = {
	type: 'checkbox' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10,
			enabled: true
		},
		{
			name: 'item2',
			price: 20,
			enabled: true
		},
		{
			name: 'item3',
			price: 30,
			enabled: true
		}
	]
}
test('validateUICustomizationsOrThrow 1', () => {
	expect(() =>
		validateUICustomizationsOrThrow({
			selectionGroups: [radioGroup1, checkboxGroup1]
		})
	).not.toThrow()
})
test('validateUICustomizationsOrThrow 2', () => {
	expect(() =>
		validateUICustomizationsOrThrow({
			selectionGroups: []
		})
	).not.toThrow()
})
test('validateUICustomizationsOrThrow all disabled', () => {
	expect(() =>
		validateUICustomizationsOrThrow({
			selectionGroups: [
				{
					type: 'radio',
					title: 'Choose one',
					items: []
				}
			]
		})
	).toThrow()
	expect(() =>
		validateUICustomizationsOrThrow({
			selectionGroups: [
				{
					type: 'radio',
					title: 'Choose one',
					items: [
						{
							name: 'item1',
							price: 10,
							enabled: false
						}
					]
				}
			]
		})
	).toThrow()
})
test('radio group with one selection', () => {
	expect(
		calculatePriceOfCustomizations(
			{
				selectionGroups: [radioGroup1]
			},
			[true, false]
		)
	).toBe(10)
})
test('radio group with two selections (invalid)', () => {
	expect(() =>
		calculatePriceOfCustomizations(
			{
				selectionGroups: [radioGroup1]
			},
			[true, true]
		)
	).toThrow()
})
test('radio group with no selections (invalid)', () => {
	expect(() =>
		calculatePriceOfCustomizations(
			{
				selectionGroups: [radioGroup1]
			},
			[false, false]
		)
	).toThrow()
})
test('checkbox group two selection', () => {
	expect(
		calculatePriceOfCustomizations(
			{
				selectionGroups: [checkboxGroup1]
			},
			[true, true, false]
		)
	).toBe(30)
})
test('checkbox group with zero selection', () => {
	expect(
		calculatePriceOfCustomizations(
			{
				selectionGroups: [checkboxGroup1]
			},
			[false, false, false]
		)
	).toBe(0)
})
test('composed radio and checkbox group', () => {
	expect(
		calculatePriceOfCustomizations(
			{
				selectionGroups: [radioGroup1, checkboxGroup1]
			},
			[true, false, false, true, true]
		)
	).toBe(60)
})
test('composed radio and checkbox group (invalid radio)', () => {
	expect(() =>
		calculatePriceOfCustomizations(
			{
				selectionGroups: [radioGroup1, checkboxGroup1]
			},
			[true, true, false, true, true]
		)
	).toThrow()
})
test('statuses length does not match number of items (invalid)', () => {
	expect(() =>
		calculatePriceOfCustomizations(
			{
				selectionGroups: [radioGroup1]
			},
			[false]
		)
	).toThrow()
	expect(() =>
		calculatePriceOfCustomizations(
			{
				selectionGroups: [radioGroup1]
			},
			[false, false, false]
		)
	).toThrow()
})
const radioGroup2 = {
	type: 'radio' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10,
			enabled: true
		},
		{
			name: 'item2',
			price: 20,
			enabled: false
		},
		{
			name: 'item3',
			price: 30,
			enabled: true
		}
	]
}
const checkboxGroup2 = {
	type: 'checkbox' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10,
			enabled: true
		},
		{
			name: 'item2',
			price: 20,
			enabled: false
		},
		{
			name: 'item3',
			price: 30,
			enabled: true
		}
	]
}
test('radio group (selecting disabled item)', () => {
	expect(() =>
		calculatePriceOfCustomizations(
			{
				selectionGroups: [radioGroup2]
			},
			[false, true, false]
		)
	).toThrow()
})
test('radio group (selecting disabled item)', () => {
	expect(() =>
		calculatePriceOfCustomizations(
			{
				selectionGroups: [checkboxGroup2]
			},
			[false, true, false]
		)
	).toThrow()
})
