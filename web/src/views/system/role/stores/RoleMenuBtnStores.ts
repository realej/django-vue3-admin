import { defineStore } from 'pinia';
import { RoleMenuBtnType } from '../types';
/**
 * Permission configuration：Role-menu-Button
 */

export const RoleMenuBtnStores = defineStore('RoleMenuBtnStores', {
	state: (): RoleMenuBtnType[] => [],
	actions: {
		/**
		 * initialization
		 */
		setState(data: RoleMenuBtnType[]) {
			this.$state = data;
			this.$state.length = data.length;
		},
		updateState(data: RoleMenuBtnType) {
			const index = this.$state.findIndex((item) => item.id === data.id);
			if (index !== -1) {
				this.$state[index] = data;
			}
		},
	},
});
