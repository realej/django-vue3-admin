import { defineStore } from 'pinia';
import { RoleUsersType } from '../types';
import { getAllUsers } from '../components/api';
import XEUtils from 'xe-utils';
/**
 * Permission drawer：Role-user
 */

export const RoleUsersStores = defineStore('RoleUsersStores', {
	state: (): RoleUsersType => ({
		all_users: [],
		right_users: [],
	}),
	actions: {
		get_all_users() {
			getAllUsers().then((res: any) => {
				this.$state.all_users = res;
			});
		},
		set_right_users(users: any) {
			this.$state.right_users = XEUtils.map(users, (item: any) => item.id);
		},
	},
});
