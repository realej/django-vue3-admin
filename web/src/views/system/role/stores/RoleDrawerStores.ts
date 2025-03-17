import { defineStore } from 'pinia';
import { RoleDrawerType } from '../types';
/**
 * Permission configuration：drawer
 */
const initialState: RoleDrawerType = {
	drawerVisible: false,
	roleId: undefined,
	roleName: undefined,
	users: [],
};

export const RoleDrawerStores = defineStore('RoleDrawerStores', {
	state: (): RoleDrawerType => ({
		...initialState,
	}),
	actions: {
		/**
		 * Open the permissions to modify the drawer
		 */
		handleDrawerOpen(row: any) {
			this.drawerVisible = true;
			this.set_state(row);
		},
		set_state(row: any) {
			this.roleName = row.name;
			this.roleId = row.id;
			this.users = row.users;
		},
		/**
		 * Close permissions to modify the drawer
		 */
		handleDrawerClose() {
			Object.assign(this.$state, initialState);
		},
	},
});
