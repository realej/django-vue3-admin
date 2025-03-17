import { defineStore } from 'pinia';
import { RoleMenuTreeType } from '../types';
/**
 * Permission drawer：Role-menu
 */

export const RoleMenuTreeStores = defineStore('RoleMenuTreeStores', {
	state: (): RoleMenuTreeType => ({
		id: 0,
		parent: 0,
		name: '',
		isCheck: false,
		is_catalog: false,
	}),
	actions: {
		/** Assignment */
		setRoleMenuTree(data: RoleMenuTreeType) {
			this.$state = data;
		},
	},
});
