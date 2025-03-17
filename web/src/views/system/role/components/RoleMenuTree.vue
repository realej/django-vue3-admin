<template>
	<el-tree
		ref="treeRef"
		:data="menuData"
		:props="defaultTreeProps"
		:default-checked-keys="menuDefaultCheckedKeys"
		@check-change="handleMenuChange"
		@node-click="handleMenuClick"
		node-key="id"
		check-strictly
		highlight-current
		show-checkbox
		default-expand-all
	>
	</el-tree>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RoleDrawerStores } from '../stores/RoleDrawerStores';
import { RoleMenuTreeStores } from '../stores/RoleMenuTreeStores';
import { RoleMenuBtnStores } from '../stores/RoleMenuBtnStores';
import { RoleMenuFieldStores } from '../stores/RoleMenuFieldStores';
import { RoleMenuFieldHeaderStores } from '../stores/RoleMenuFieldStores';
import { getRoleMenu, getRoleMenuBtnField, setRoleMenu } from './api';
import { ElMessage } from 'element-plus';
import XEUtils from 'xe-utils';
import { RoleMenuTreeType } from '../types';

const RoleDrawer = RoleDrawerStores(); // Role-drawer
const RoleMenuTree = RoleMenuTreeStores(); // Role-menu
const RoleMenuBtn = RoleMenuBtnStores(); // Role-menu-Button
const RoleMenuField = RoleMenuFieldStores(); // Role-menu-Column fields
const RoleMenuFieldHeader = RoleMenuFieldHeaderStores();// Role-menu-Column fields
const menuData = ref<RoleMenuTreeType[]>([]); // Menu list data
const menuDefaultCheckedKeys = ref<(number | string | undefined)[]>([]); // The menu list selected by default
// Menu Configuration
const defaultTreeProps = {
	children: 'children',
	label: 'name',
	value: 'id',
};

/**
 * Menu check box selected
 * @param node：The current node's Node Object
 * @param checked：Boolean value，Indicates whether the current node is selected
 */
const handleMenuChange = (node: any, checked: boolean) => {
	setRoleMenu({ roleId: RoleDrawer.roleId, menuId: node.id, isCheck: checked }).then((res: any) => {
		ElMessage({ message: res.msg, type: 'success' });
	});
};
/**
 * Menu click event
 */
const handleMenuClick = async (selectNode: RoleMenuTreeType) => {
	if (!selectNode.is_catalog) {
		RoleMenuTree.setRoleMenuTree(selectNode); // Update the currently selected menu
		// Get the button list for the current menu
		const { data } = await getRoleMenuBtnField({
			roleId: RoleDrawer.roleId,
			menuId: selectNode.id,
		});
		RoleMenuBtn.setState(data.menu_btn); // Update button list
		RoleMenuField.setState(data.menu_field); // Update column field list
	} else {
		RoleMenuBtn.setState([]); // Update button list
		RoleMenuField.setState([]); // Update column field list
	}
	RoleMenuFieldHeader.$reset()
};

// Get list data after the page is opened
onMounted(async () => {
	menuData.value = await getRoleMenu({ roleId: RoleDrawer.roleId });
	menuDefaultCheckedKeys.value = XEUtils.toTreeArray(menuData.value)
		.filter((i) => i.isCheck)
		.map((i) => i.id);
});
</script>
