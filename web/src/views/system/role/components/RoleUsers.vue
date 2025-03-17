<template>
	<el-transfer
		v-model="RoleUsers.$state.right_users"
		filterable
		:titles="['Unauthorized user', 'Authorized user']"
		:data="RoleUsers.$state.all_users"
		:props="{
			key: 'id',
			label: 'name',
		}"
		@change="handleChange"
	/>
</template>

<script lang="ts" setup>
import { ElMessage } from 'element-plus';
import { RoleDrawerStores } from '../stores/RoleDrawerStores';
import { RoleUsersStores } from '../stores/RoleUsersStores';
import { setRoleUsers } from './api';
const RoleDrawer = RoleDrawerStores(); // Drawer parameters
const RoleUsers = RoleUsersStores(); // Role-user

/**
 *
 * @param value The user selected on the right
 * @param direction Direction of movement
 * @param movedKeys Mobile users
 */
const handleChange = (value: number[] | string[], direction: 'left' | 'right', movedKeys: string[] | number[]) => {
	setRoleUsers(RoleDrawer.$state.roleId, { direction, movedKeys }).then((res:any) => {
		RoleDrawer.set_state(res.data)
		ElMessage({ message: res.msg, type: 'success' });
	});
};
</script>
