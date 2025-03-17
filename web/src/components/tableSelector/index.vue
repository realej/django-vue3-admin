<template>
	<el-select
		popper-class="popperClass"
		class="tableSelector"
		multiple
		@remove-tag="removeTag"
		v-model="data"
		placeholder="Please select"
		@visible-change="visibleChange"
	>
		<template #empty>
			<div class="option">
				<el-input style="margin-bottom: 10px" v-model="search" clearable placeholder="Please enter keywords" @change="getDict" @clear="getDict">
					<template #append>
						<el-button type="primary" icon="Search" />
					</template>
				</el-input>
				<el-table
					ref="tableRef"
					:data="tableData"
					size="mini"
					border
					row-key="id"
					:lazy="props.tableConfig.lazy"
					:load="props.tableConfig.load"
					:tree-props="props.tableConfig.treeProps"
					style="width: 400px"
					max-height="200"
					height="200"
					:highlight-current-row="!props.tableConfig.isMultiple"
					@selection-change="handleSelectionChange"
					@current-change="handleCurrentChange"
				>
					<el-table-column v-if="props.tableConfig.isMultiple" fixed type="selection" width="55" />
					<el-table-column fixed type="index" label="#" width="50" />
					<el-table-column
						:prop="item.prop"
						:label="item.label"
						:width="item.width"
						v-for="(item, index) in props.tableConfig.columns"
						:key="index"
					/>
				</el-table>
				<el-pagination
					style="margin-top: 10px"
					background
					v-model:current-page="pageConfig.page"
					v-model:page-size="pageConfig.limit"
					layout="prev, pager, next"
					:total="pageConfig.total"
					@current-change="handlePageChange"
				/>
			</div>
		</template>
	</el-select>
</template>

<script setup lang="ts">
import { defineProps, reactive, ref, watch } from 'vue';
import XEUtils from 'xe-utils';
import { request } from '/@/utils/service';

const props = defineProps({
	modelValue: {},
	tableConfig: {
		url: null,
		label: null, //Display value
		value: null, //Data value
		isTree: false,
		lazy: true,
		load: () => {},
		data: [], //Default data
		isMultiple: false, //Whether to choose multiple choices
		treeProps: { children: 'children', hasChildren: 'hasChildren' },
		columns: [], //List items corresponding to each item
	},
	displayLabel: {},
} as any);
const emit = defineEmits(['update:modelValue']);
// tableRef
const tableRef = ref();
// templateUse ondata
const data = ref();
// Multiple selection values
const multipleSelection = ref();
// Search for value
const search = ref(undefined);
//Tabular data
const tableData = ref();
// Pagination configuration
const pageConfig = reactive({
	page: 1,
	limit: 10,
	total: 0,
});

/**
 * Multiple selection of forms
 * @param val:Array
 */
const handleSelectionChange = (val: any) => {
	multipleSelection.value = val;
	const { tableConfig } = props;
	const result = val.map((item: any) => {
		return item[tableConfig.value];
	});
	data.value = val.map((item: any) => {
		return item[tableConfig.label];
	});

	emit('update:modelValue', result);
};
/**
 * Single selection of tables
 * @param val:Object
 */
const handleCurrentChange = (val: any) => {
	const { tableConfig } = props;
	if (!tableConfig.isMultiple && val) {
		data.value = [val[tableConfig.label]];
		emit('update:modelValue', val[tableConfig.value]);
	}
};

/**
 * Get dictionary value
 */
const getDict = async () => {
	const url = props.tableConfig.url;
	const params = {
		page: pageConfig.page,
		limit: pageConfig.limit,
		search: search.value,
	};
	const { data, page, limit, total } = await request({
		url: url,
		params: params,
	});
	pageConfig.page = page;
	pageConfig.limit = limit;
	pageConfig.total = total;
	if (props.tableConfig.data === undefined || props.tableConfig.data.length === 0) {
		if (props.tableConfig.isTree) {
			tableData.value = XEUtils.toArrayTree(data, { parentKey: 'parent', key: 'id', children: 'children' });
		} else {
			tableData.value = data;
		}
	} else {
		tableData.value = props.tableConfig.data;
	}
};

/**
 * Pull down box expand/closure
 * @param bool
 */
const visibleChange = (bool: any) => {
	if (bool) {
		getDict();
	}
};

/**
 * Pagination
 * @param page
 */
const handlePageChange = (page: any) => {
	pageConfig.page = page;
	getDict();
};

// monitordisplayLabelChanges，Update data
watch(
	() => {
		return props.displayLabel;
	},
	(value) => {
		const { tableConfig } = props;
		const result = value
			? value.map((item: any) => { return item[tableConfig.label];})
			: null;
		data.value = result;
	},
	{ immediate: true }
);
</script>

<style scoped>
.option {
	height: auto;
	line-height: 1;
	padding: 5px;
	background-color: #fff;
}
</style>
<style lang="scss">
.popperClass {
	height: 320px;
}

.el-select-dropdown__wrap {
	max-height: 310px !important;
}

.tableSelector {
	.el-icon,
	.el-tag__close {
		display: none;
	}
}
</style>
