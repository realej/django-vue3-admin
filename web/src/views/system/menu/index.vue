<template>
	<fs-page>
		<el-row class="menu-el-row">
			<el-col :span="6">
				<div class="menu-box menu-left-box">
					<MenuTreeCom
						ref="menuTreeRef"
						:treeData="menuTreeData"
						@treeClick="handleTreeClick"
						@updateDept="handleUpdateMenu"
						@deleteDept="handleDeleteMenu"
					/>
				</div>
			</el-col>

			<el-col :span="18">
        <el-tabs type="border-card">
          <el-tab-pane label="Button permission configuration" >
            <div style="height: 72vh">
              <MenuButtonCom ref="menuButtonRef" />
            </div>
          </el-tab-pane>
          <el-tab-pane label="Column permission configuration">
            <div style="height: 72vh">
              <MenuFieldCom ref="menuFieldRef"></MenuFieldCom>
            </div>
          </el-tab-pane>
        </el-tabs>

			</el-col>
		</el-row>

		<el-drawer v-model="drawerVisible" title="Menu Configuration" direction="rtl" size="500px" :close-on-click-modal="false" :before-close="handleDrawerClose">
			<MenuFormCom
				v-if="drawerVisible"
				:initFormData="drawerFormData"
				:cacheData="menuTreeCacheData"
				:treeData="menuTreeData"
				@drawerClose="handleDrawerClose"
			/>
		</el-drawer>
	</fs-page>
</template>

<script lang="ts" setup name="menuPages">
import { ref, onMounted } from 'vue';
import XEUtils from 'xe-utils';
import { ElMessageBox } from 'element-plus';
import MenuTreeCom from './components/MenuTreeCom/index.vue';
import MenuButtonCom from './components/MenuButtonCom/index.vue';
import MenuFormCom from './components/MenuFormCom/index.vue';
import MenuFieldCom from './components/MenuFieldCom/index.vue';
import { GetList, DelObj } from './api';
import { successNotification } from '/@/utils/message';
import { APIResponseData, MenuTreeItemType } from './types';

let menuTreeData = ref([]);
let menuTreeCacheData = ref<MenuTreeItemType[]>([]);
let drawerVisible = ref(false);
let drawerFormData = ref<Partial<MenuTreeItemType>>({});
let menuTreeRef = ref<InstanceType<typeof MenuTreeCom> | null>(null);
let menuButtonRef = ref<InstanceType<typeof MenuButtonCom> | null>(null);
let menuFieldRef = ref<InstanceType<typeof MenuFieldCom> | null>(null);
const getData = () => {
	GetList({}).then((ret: APIResponseData) => {
		const responseData = ret.data;
		const result = XEUtils.toArrayTree(responseData, {
			parentKey: 'parent',
			children: 'children',
			strict: true,
		});
		menuTreeData.value = result;
	});
};

/**
 * Menu click event
 */
const handleTreeClick = (record: MenuTreeItemType) => {
	menuButtonRef.value?.handleRefreshTable(record);
  menuFieldRef.value?.handleRefreshTable(record)
};

/**
 * Department of New or edit event
 */
const handleUpdateMenu = (type: string, record?: MenuTreeItemType) => {
	if (type === 'update' && record) {
		const parentData = menuTreeRef.value?.treeRef?.currentNode.parent.data || {};
		menuTreeCacheData.value = [parentData];
		drawerFormData.value = record;
	}
	drawerVisible.value = true;
};
const handleDrawerClose = (type?: string) => {
	if (type === 'submit') {
		getData();
	}
	drawerVisible.value = false;
	drawerFormData.value = {};
};

/**
 * Department deletion event
 */
const handleDeleteMenu = (id: string, callback: Function) => {
	ElMessageBox.confirm('Have you confirmed that you deleted this menu item?', 'Kind tips', {
		confirmButtonText: 'confirm',
		cancelButtonText: 'Cancel',
		type: 'warning',
	}).then(async () => {
		const res: APIResponseData = await DelObj(id);
		callback();
		if (res?.code === 2000) {
			successNotification(res.msg as string);
			getData();
		}
	});
};

onMounted(() => {
	getData();
});
</script>

<style lang="scss" scoped>
.menu-el-row {
	height: 100%;
	overflow: hidden;

	.el-col {
		height: 100%;
		padding: 10px 0;
		box-sizing: border-box;
	}
}

.menu-box {
	height: 100%;
	padding: 10px;
	background-color: var(--el-fill-color-blank);;
	box-sizing: border-box;
}

.menu-left-box {
	position: relative;
	border-radius: 0 8px 8px 0;
	margin-right: 10px;
}

.menu-right-box {
	border-radius: 8px 0 0 8px;
}
</style>
