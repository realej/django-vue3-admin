<template>
	<el-drawer
		v-model="RoleDrawer.drawerVisible"
		title="Permission configuration"
		direction="rtl"
		size="80%"
		:close-on-click-modal="false"
		:before-close="RoleDrawer.handleDrawerClose"
		:destroy-on-close="true"
	>
		<template #header>
			<div>
				Current authorized role：
				<el-tag style="margin-right: 20px">{{ RoleDrawer.roleName }}</el-tag>
				Authorized Personnel：
				<el-button size="small" :icon="UserFilled" @click="handleUsers">{{ RoleDrawer.users.length }}</el-button>
			</div>
		</template>
		<splitpanes class="default-theme" style="height: 100%">
			<pane min-size="20" size="22">
				<div class="pane-box">
					<MenuTreeCom />
				</div>
			</pane>
			<pane min-size="20">
				<div class="pane-box">
					<el-tabs v-model="activeName" class="demo-tabs">
						<el-tab-pane label="Interface permissions" name="first"><MenuBtnCom /></el-tab-pane>
						<el-tab-pane label="Column field permissions" name="second"><MenuFieldCom /></el-tab-pane>
					</el-tabs>
				</div>
			</pane>
		</splitpanes>
	</el-drawer>

	<el-dialog v-model="dialogVisible" title="Authorized User" width="700px" :close-on-click-modal="false">
		<RoleUsersCom />
	</el-dialog>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { UserFilled } from '@element-plus/icons-vue';
import { RoleDrawerStores } from '../stores/RoleDrawerStores';
import { defineAsyncComponent, ref } from 'vue';
import { RoleUsersStores } from '../stores/RoleUsersStores';

const MenuTreeCom = defineAsyncComponent(() => import('./RoleMenuTree.vue'));
const MenuBtnCom = defineAsyncComponent(() => import('./RoleMenuBtn.vue'));
const MenuFieldCom = defineAsyncComponent(() => import('./RoleMenuField.vue'));
const RoleUsersCom = defineAsyncComponent(() => import('./RoleUsers.vue'));
const RoleDrawer = RoleDrawerStores(); // Drawer parameters
const RoleUsers = RoleUsersStores(); // Role-user
const activeName = ref('first');

const dialogVisible = ref(false);

const handleUsers = () => {
	dialogVisible.value = true;
	RoleUsers.get_all_users(); // Get all users
	RoleUsers.set_right_users(RoleDrawer.$state.users); // Settings selected users
};
</script>

<style lang="scss" scoped>
.pane-box {
	width: 100vw; /* Viewport width */
	height: 100vh; /* Viewport height */
	max-width: 100%; /* Make sure not exceeds the width of the parent element */
	max-height: 100%; /* Make sure not exceeds the height of the parent element */
	overflow: auto; /* Show scrollbar when content exceeds container size */
	padding: 10px;
	background-color: #fff;
}
</style>
