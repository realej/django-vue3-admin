import { defineStore } from 'pinia';
import { RoleMenuFieldType, RoleMenuFieldHeaderType } from '../types';
/**
 * Permission configuration：Role-menu-Column fields
 */

export const RoleMenuFieldStores = defineStore('RoleMenuFieldStores', {
	state: (): RoleMenuFieldType[] => [],
	actions: {
		/** Reset */
		setState(data: RoleMenuFieldType[]) {
			this.$state = data;
			this.$state.length = data.length;
		},
	},
});

export const RoleMenuFieldHeaderStores = defineStore('RoleMenuFieldHeaderStores', {
	state: (): RoleMenuFieldHeaderType[] => [
		{ value: 'is_create', label: 'Added visible', disabled: 'disabled_create', checked: false },
		{ value: 'is_update', label: 'Edit visible', disabled: 'disabled_update', checked: false },
		{ value: 'is_query', label: 'The list is visible', disabled: 'disabled_query', checked: false },
	],
});
