import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { calculatePriceOfCustomizations } from './customizations'

const radioGroup1 = {
	type: 'radio' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10
		},
		{
			name: 'item2',
			price: 20
		}
	]
}
const checkboxGroup1 = {
	type: 'checkbox' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10
		},
		{
			name: 'item2',
			price: 20
		},
		{
			name: 'item3',
			price: 30
		}
	]
}
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
			[false, false, false]
		)
	).toThrow()
})
