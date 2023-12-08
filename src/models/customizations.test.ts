import { expect, test, describe, beforeAll, jest } from '@jest/globals'
import { calculatePriceOfCustomizations } from './customizations'

const radioGroup1 = {
	type: 'radio' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10,
			status: true
		},
		{
			name: 'item2',
			price: 20,
			status: false
		}
	]
}
test('test radio group 1', () => {
	expect(
		calculatePriceOfCustomizations({
			selectionGroups: [radioGroup1]
		})
	).toBe(10)
})
const invalidRadioGroup1 = {
	type: 'radio' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10,
			status: true
		},
		{
			name: 'item2',
			price: 20,
			status: true
		}
	]
}
test('test invalid radio group 1', () => {
	expect(() =>
		calculatePriceOfCustomizations({
			selectionGroups: [invalidRadioGroup1]
		})
	).toThrow()
})
const invalidRadioGroup2 = {
	type: 'radio' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10,
			status: false
		},
		{
			name: 'item2',
			price: 20,
			status: false
		}
	]
}
test('test invalid radio group 2', () => {
	expect(() =>
		calculatePriceOfCustomizations({
			selectionGroups: [invalidRadioGroup2]
		})
	).toThrow()
})
const checkboxGroup1 = {
	type: 'checkbox' as const,
	title: 'Choose one',
	items: [
		{
			name: 'item1',
			price: 10,
			status: true
		},
		{
			name: 'item2',
			price: 20,
			status: true
		},
		{
			name: 'item3',
			price: 30,
			status: false
		}
	]
}
test('test checkbox group 1', () => {
	expect(
		calculatePriceOfCustomizations({
			selectionGroups: [checkboxGroup1]
		})
	).toBe(30)
})
const invalidCheckboxGroup1 = {
	type: 'checkbox' as const,
	title: 'Choose one',
	items: []
}
test('test invalid checkbox group 1', () => {
	expect(() =>
		calculatePriceOfCustomizations({
			selectionGroups: [invalidCheckboxGroup1]
		})
	).toThrow()
})
