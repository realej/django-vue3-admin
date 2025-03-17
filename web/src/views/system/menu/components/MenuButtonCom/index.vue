<template>
	<fs-crud ref="crudRef"  v-bind="crudBinding"> 
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
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { MenuTreeItemType } from '../../types';
import { ElMessage, ElMessageBox } from 'element-plus';
import XEUtils from 'xe-utils';
import { BatchDelete } from './api';
import { Close, Delete } from '@element-plus/icons-vue';
// The currently selected menu information
let selectOptions: any = ref({ name: null });

const { crudRef, crudBinding, crudExpose, context,selectedRows } = useFs({ createCrudOptions, context: { selectOptions } });
const { doRefresh, setTableData } = crudExpose;

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
const handleRefreshTable = (record: MenuTreeItemType) => {
	if (!record.is_catalog && record.id) {
		selectOptions.value = record;
		doRefresh();
	} else {
		//Clear table data
		setTableData([]);
	}
};

defineExpose({ selectOptions, handleRefreshTable });
</script>
