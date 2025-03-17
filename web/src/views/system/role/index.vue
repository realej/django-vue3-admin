<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
		<PermissionDrawerCom />
	</fs-page>
</template>

<script lang="ts" setup name="role">
import { defineAsyncComponent, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { RoleDrawerStores } from './stores/RoleDrawerStores';
import { RoleMenuBtnStores } from './stores/RoleMenuBtnStores';
import { RoleMenuFieldStores } from './stores/RoleMenuFieldStores';
import { RoleUsersStores } from './stores/RoleUsersStores';

const PermissionDrawerCom = defineAsyncComponent(() => import('./components/RoleDrawer.vue'));

const RoleDrawer = RoleDrawerStores(); // Role-drawer
const RoleMenuBtn = RoleMenuBtnStores(); // Role-menu
const RoleMenuField = RoleMenuFieldStores();// Role-menu-Fields
const RoleUsers = RoleUsersStores();// Role-user
const { crudBinding, crudRef, crudExpose } = useFs({
	createCrudOptions,
	context: { RoleDrawer, RoleMenuBtn, RoleMenuField },
});

// Get list data after the page is opened
onMounted(async () => {
	// refresh
	crudExpose.doRefresh();
	// Get all users
	RoleUsers.get_all_users();

});
</script>
