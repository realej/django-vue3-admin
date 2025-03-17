<template>
	<div>
		<el-dialog ref="modelRef" v-model="modelDialog" title="choosemodel">
			<div v-show="props.model">
				<el-tag>Selected:{{ props.model }}</el-tag>
			</div>
			<!-- Search input box -->
			<el-input v-model="searchQuery" placeholder="Search for models..." style="margin-bottom: 10px"></el-input>
			<div class="model-card">
				<!--Comment number:django-vue3-admin-index483211: Returned from the requestallModelDataconductcomputedcalculate，Return to the search box to match the content-->
				<div v-for="(item, index) in filteredModelData" :value="item.key" :key="index">
					<el-text :type="modelCheckIndex === index ? 'primary' : ''" @click="onModelChecked(item, index)">
						{{ item.app + '--' + item.title + '(' + item.key + ')' }}
					</el-text>
				</div>
			</div>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="modelDialog = false">Cancel</el-button>
					<el-button type="primary" @click="handleAutomatch"> Sure </el-button>
				</span>
			</template>
		</el-dialog>
		<div style="height: 72vh">
			<fs-crud ref="crudRef" v-bind="crudBinding">
				<template #pagination-left>
					<el-tooltip content="Batch Delete">
						<el-button text type="danger" :disabled="selectedRowsCount === 0" :icon="Delete" circle @click="handleBatchDelete" />
					</el-tooltip>
				</template>
				<template #pagination-right>
					<el-popover placement="top" :width="400" trigger="click">
						<template #reference>
							<el-button text :type="selectedRowsCount > 0 ? 'primary' : ''">Selected{{ selectedRowsCount }}Data</el-button>
						</template>
						<el-table :data="selectedRows" size="small">
							<el-table-column width="150" property="id" label="id" />
							<el-table-column fixed="right" label="operate" min-width="60">
								<template #default="scope">
									<el-button text type="info" :icon="Close" @click="removeSelectedRows(scope.row)" circle />
								</template>
							</el-table-column>
						</el-table>
					</el-popover>
				</template>
			</fs-crud>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { BatchDelete, getModelList } from './api';
import { Close, Delete } from '@element-plus/icons-vue';
import { MenuTreeItemType } from '/@/views/system/menu/types';
import { successMessage, successNotification, warningNotification } from '/@/utils/message';
import { automatchColumnsData } from '/@/views/system/columns/components/ColumnsTableCom/api';
import XEUtils from 'xe-utils';
import { ElMessage, ElMessageBox } from 'element-plus';
// The currently selected menu information
let selectOptions: any = ref({ name: null });

const props = reactive({
	model: '',
	app: '',
	menu: '',
});

//modelPop-up window
const modelDialog = ref(false);
// Get allmodel
const allModelData = ref<any[]>([]);
const modelCheckIndex = ref(null);
const onModelChecked = (row, index) => {
	modelCheckIndex.value = index;
	props.model = row.key;
	props.app = row.app;
};

// Comment number:django-vue3-admin-index083311:The code starts
// Function description:Coordinate search processing，Return to search results
const searchQuery = ref('');

const filteredModelData = computed(() => {
	if (!searchQuery.value) {
		return allModelData.value;
	}
	const query = searchQuery.value.toLowerCase();
	return allModelData.value.filter(
		(item) => item.app.toLowerCase().includes(query) || item.title.toLowerCase().includes(query) || item.key.toLowerCase().includes(query)
	);
});
// Comment number:django-vue3-admin-index083311:End line of code

/**
 * When the menu is selected,Load table data
 * @param record
 */
const handleRefreshTable = (record: MenuTreeItemType) => {
	if (!record.is_catalog && record.id) {
		selectOptions.value = record;
		crudExpose.doRefresh();
	} else {
		//Clear table data
		crudExpose.setTableData([]);
	}
};
/**
 * Automatically match columns
 */
const handleAutomatch = async () => {
	props.menu = selectOptions.value.id;
	modelDialog.value = false;
	if (props.menu && props.model) {
		const res = await automatchColumnsData(props);
		if (res?.code === 2000) {
			successNotification('Match successfully');
		}
		crudExpose.doSearch({ form: { menu: props.menu, model: props.model } });
	} else {
		warningNotification('Please select the role and model table！');
	}
};

// Number of rows selected
const selectedRowsCount = computed(() => {
	return selectedRows.value.length;
});

// Batch Delete
const handleBatchDelete = async () => {
	await ElMessageBox.confirm(`Make sure you want to delete this in batches${selectedRows.value.length}Is it a record`, 'confirm', {
		distinguishCancelAndClose: true,
		confirmButtonText: 'Sure',
		cancelButtonText: 'Cancel',
		closeOnClickModal: false,
	});
	await BatchDelete(XEUtils.pluck(selectedRows.value, 'id'));
	ElMessage.info('Delete successfully');
	selectedRows.value = [];
	await crudExpose.doRefresh();
};

// Remove the selected row
const removeSelectedRows = (row: any) => {
	const tableRef = crudExpose.getBaseTableRef();
	const tableData = crudExpose.getTableData();
	if (XEUtils.pluck(tableData, 'id').includes(row.id)) {
		tableRef.toggleRowSelection(row, false);
	} else {
		selectedRows.value = XEUtils.remove(selectedRows.value, (item: any) => item.id !== row.id);
	}
};

const { crudBinding, crudRef, crudExpose, selectedRows } = useFs({ createCrudOptions, props, modelDialog, selectOptions, allModelData });
onMounted(async () => {
	const res = await getModelList();
	allModelData.value = res.data;
});

defineExpose({ selectOptions, handleRefreshTable });
</script>

<style scoped lang="scss">
.model-card {
	margin-top: 10px;
	height: 30vh;
	overflow-y: scroll;

	div {
		margin: 15px 0;
		cursor: pointer;
	}
}
</style>
