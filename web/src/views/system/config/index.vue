<template>
	<el-card>
		<div>
			<el-header>
				<div class="yxt-flex-between">
					<div>
						<el-tag>System configuration:You can customize your website</el-tag>
					</div>
					<div>
						<el-button-group>
							<el-button type="primary" size="small" :icon="FolderAdd" @click="tabsDrawer = true"> Add grouping </el-button>
							<el-button size="small" type="warning" :icon="Edit" @click="contentDrawer = true"> Add content </el-button>
						</el-button-group>
					</div>
				</div>
			</el-header>
		</div>
		<div>
			<el-drawer v-if="tabsDrawer" title="Add grouping" v-model="tabsDrawer" direction="rtl" size="30%">
				<addTabs></addTabs>
			</el-drawer>
		</div>
		<div>
			<el-drawer v-if="contentDrawer" title="Add content" v-model="contentDrawer" direction="rtl" size="30%">
				<addContent></addContent>
			</el-drawer>
		</div>
		<el-tabs type="border-card" v-model="editableTabsValue">
			<el-tab-pane :key="index" v-for="(item, index) in editableTabs" :label="item.title" :name="item.key">
				<span slot="label" v-if="item.icon"><i :class="item.icon" style="font-weight: 1000; font-size: 16px"></i></span>
				<el-row v-if="item.icon">
					<el-col :offset="4" :span="8">
						<addContent></addContent>
					</el-col>
				</el-row>
				<formContent v-else :options="item" :editableTabsItem="item"></formContent>
			</el-tab-pane>
		</el-tabs>
	</el-card>
</template>

<script lang="ts" setup name="config">
import { Edit, FolderAdd } from '@element-plus/icons-vue';
import * as api from './api';
import addTabs from './components/addTabs.vue';
import addContent from './components/addContent.vue';
import formContent from './components/formContent.vue';
import { ref, onMounted } from 'vue';
let tabsDrawer = ref(false);
let contentDrawer = ref(false);
let editableTabsValue = ref('base');
let editableTabs: any = ref([]);

const getTabs = () => {
	api
		.GetList({
			limit: 999,
			parent__isnull: true,
		})
		.then((res: any) => {
			let data = res.data;
			data.push({
				title: 'none',
				icon: 'el-icon-plus',
				key: 'null',
			});
			editableTabs.value = data;
		});
};

onMounted(() => {
	getTabs();
});
</script>

<style>
/*use flex  Align both sides*/
.yxt-flex-between {
	display: flex;
	justify-content: space-between;
}
</style>
