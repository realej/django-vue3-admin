<template>
	<div class="pccm-item" v-if="RoleMenuBtn.$state.length > 0">
		<div class="menu-form-alert">Configure operation function interface permissions，Configure data permissions click pinion</div>
		<el-checkbox v-for="btn in RoleMenuBtn.$state" :key="btn.id" v-model="btn.isCheck" @change="handleCheckChange(btn)">
			<div class="btn-item">
				{{ btn.data_range !== null ? `${btn.name}(${formatDataRange(btn.data_range)})` : btn.name }}
				<span v-show="btn.isCheck" @click.stop.prevent="handleSettingClick(btn)">
					<el-icon>
						<Setting />
					</el-icon>
				</span>
			</div>
		</el-checkbox>
	</div>
	<el-dialog v-model="dialogVisible" title="Data permission configuration" width="400px" :close-on-click-modal="false" :before-close="handleDialogClose">
		<div class="pc-dialog">
			<el-select v-model="selectBtn.data_range" @change="handlePermissionRangeChange" placeholder="Please select">
				<el-option v-for="item in dataPermissionRange" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
			<el-tree-select
				v-show="selectBtn.data_range === 4"
				node-key="id"
				v-model="selectBtn.dept"
				:props="defaultTreeProps"
				:data="deptData"
				multiple
				check-strictly
				:render-after-expand="false"
				show-checkbox
				class="dialog-tree"
			/>
		</div>
		<template #footer>
			<div>
				<el-button type="primary" @click="handleDialogConfirm"> Sure</el-button>
				<el-button @click="handleDialogClose"> Cancel</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RoleDrawerStores } from '../stores/RoleDrawerStores';
import { RoleMenuBtnStores } from '../stores/RoleMenuBtnStores';
import { RoleMenuTreeStores } from '../stores/RoleMenuTreeStores';
import { RoleMenuBtnType } from '../types';
import { getRoleToDeptAll, setRoleMenuBtn, setRoleMenuBtnDataRange } from './api';
import XEUtils from 'xe-utils';
import { ElMessage } from 'element-plus';
const RoleDrawer = RoleDrawerStores(); // Role-menu
const RoleMenuTree = RoleMenuTreeStores(); // Role-menu
const RoleMenuBtn = RoleMenuBtnStores(); // Role-menu-Button
const dialogVisible = ref(false);
// Selected button
const selectBtn = ref<RoleMenuBtnType>({
	id: 0,
	menu_btn_pre_id: 0,
	/** Whether to select */
	isCheck: false,
	/** Button name */
	name: '',
	/** Data permission range */
	data_range: 0,
	dept: [],
});
/**
 * Data permission range
 */
const dataPermissionRange = ref([
	{ label: 'Only the data permissions', value: 0 },
	{ label: 'This department and the following data permissions', value: 1 },
	{ label: 'Data permissions of this department', value: 2 },
	{ label: 'All data permissions', value: 3 },
	{ label: 'Custom data permissions', value: 4 },
]);
/**
 * Customize department tree configuration for data permissions
 */
const defaultTreeProps = {
	children: 'children',
	label: 'name',
	value: 'id',
};

/**
 * Custom data permission drop-down selection event
 */
const handlePermissionRangeChange = async (val: number) => {
	if (val < 4) {
		selectBtn.value.dept = [];
	}
};
/**
 * Format button data range
 */
const formatDataRange = computed(() => {
	return function (datarange: number) {
		const datarangeitem = XEUtils.find(dataPermissionRange.value, (item: any) => {
			if (item.value === datarange) {
				return item.label;
			}
		});
		return datarangeitem.label;
	};
});
/**
 * Check button
 */
const handleCheckChange = async (btn: RoleMenuBtnType) => {
	const put_data = {
		isCheck: btn.isCheck,
		roleId: RoleDrawer.roleId,
		menuId: RoleMenuTree.id,
		btnId: btn.id,
	};
	const { data, msg } = await setRoleMenuBtn(put_data);
	RoleMenuBtn.updateState(data);
	ElMessage({ message: msg, type: 'success' });
};

/**
 * Button-Data range determination
 */
const handleDialogConfirm = async () => {
	const { data, msg } = await setRoleMenuBtnDataRange(selectBtn.value);
	selectBtn.value = data;
	dialogVisible.value = false;
	ElMessage({ message: msg, type: 'success' });
};
/**
 * Data range is closed
 */
const handleDialogClose = () => {
	dialogVisible.value = false;
};

/**
 * Gear click
 */
const handleSettingClick = async (btn: RoleMenuBtnType) => {
	selectBtn.value = btn;
	dialogVisible.value = true;
};

/**
 * Departmental data
 *
 */
const deptData = ref<number[]>([]);
// Get list data after the page is opened
onMounted(async () => {
	const res = await getRoleToDeptAll({ role: RoleDrawer.roleId, menu_button: selectBtn.value.id });
	const depts = XEUtils.toArrayTree(res.data, { parentKey: 'parent', strict: false });
	deptData.value = depts;
});
</script>

<style lang="scss" scoped>
.pccm-item {
	margin-bottom: 10px;
	.menu-form-alert {
		color: #fff;
		line-height: 24px;
		padding: 8px 16px;
		margin-bottom: 20px;
		border-radius: 4px;
		background-color: var(--el-color-primary);
	}
}
// .el-checkbox {
// 	width: 200px;
// }
.btn-item {
	display: flex;
	align-items: center;
	justify-content: center; /* Center horizontally */
	.el-icon {
		margin-left: 5px;
	}
}
.dialog-tree {
	width: 100%;
	margin-top: 20px;
}
</style>
