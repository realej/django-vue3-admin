<template>
	<div class="table-container">
		<el-table
			:data="data"
			:border="setBorder"
			v-bind="$attrs"
			row-key="id"
			stripe
			style="width: 100%"
			v-loading="config.loading"
			@selection-change="onSelectionChange"
		>
			<el-table-column type="selection" :reserve-selection="true" width="30" v-if="config.isSelection" />
			<el-table-column type="index" label="Serial number" width="60" v-if="config.isSerialNo" />
			<el-table-column
				v-for="(item, index) in setHeader"
				:key="index"
				show-overflow-tooltip
				:prop="item.key"
				:width="item.colWidth"
				:label="item.title"
			>
				<template v-slot="scope">
					<template v-if="item.type === 'image'">
						<img :src="scope.row[item.key]" :width="item.width" :height="item.height" />
					</template>
					<template v-else>
						{{ scope.row[item.key] }}
					</template>
				</template>
			</el-table-column>
			<el-table-column label="operate" width="100" v-if="config.isOperate">
				<template v-slot="scope">
					<el-popconfirm title="Are you sure to delete it?？" @confirm="onDelRow(scope.row)">
						<template #reference>
							<el-button text type="primary">delete</el-button>
						</template>
					</el-popconfirm>
				</template>
			</el-table-column>
			<template #empty>
				<el-empty description="No data yet" />
			</template>
		</el-table>
		<div class="table-footer mt15">
			<el-pagination
				v-model:current-page="state.page.pageNum"
				v-model:page-size="state.page.pageSize"
				:pager-count="5"
				:page-sizes="[10, 20, 30]"
				:total="config.total"
				layout="total, sizes, prev, pager, next, jumper"
				background
				@size-change="onHandleSizeChange"
				@current-change="onHandleCurrentChange"
			>
			</el-pagination>
			<div class="table-footer-tool">
				<SvgIcon name="iconfont icon-yunxiazai_o" :size="22" title="Export" @click="onImportTable" />
				<SvgIcon name="iconfont icon-shuaxin" :size="22" title="refresh" @click="onRefreshTable" />
				<el-popover
					placement="top-end"
					trigger="click"
					transition="el-zoom-in-top"
					popper-class="table-tool-popper"
					:width="300"
					:persistent="false"
					@show="onSetTable"
				>
					<template #reference>
						<SvgIcon name="iconfont icon-quanjushezhi_o" :size="22" title="set up" />
					</template>
					<template #default>
						<div class="tool-box">
							<el-tooltip content="Drag to sort" placement="top-start">
								<SvgIcon name="fa fa-question-circle-o" :size="17" class="ml11" color="#909399" />
							</el-tooltip>
							<el-checkbox
								v-model="state.checkListAll"
								:indeterminate="state.checkListIndeterminate"
								class="ml10 mr1"
								label="Column display"
								@change="onCheckAllChange"
							/>
							<el-checkbox v-model="getConfig.isSerialNo" class="ml12 mr1" label="Serial number" />
							<el-checkbox v-model="getConfig.isSelection" class="ml12 mr1" label="Multiple choices" />
						</div>
						<el-scrollbar>
							<div ref="toolSetRef" class="tool-sortable">
								<div class="tool-sortable-item" v-for="v in header" :key="v.key" :data-key="v.key">
									<i class="fa fa-arrows-alt handle cursor-pointer"></i>
									<el-checkbox v-model="v.isCheck" size="default" class="ml12 mr8" :label="v.title" @change="onCheckChange" />
								</div>
							</div>
						</el-scrollbar>
					</template>
				</el-popover>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="netxTable">
import { reactive, computed, nextTick, ref } from 'vue';
import { ElMessage } from 'element-plus';
import table2excel from 'js-table2excel';
import Sortable from 'sortablejs';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import '/@/theme/tableTool.scss';

// Define the value passed by the parent component
const props = defineProps({
	// List content
	data: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	// Header content
	header: {
		type: Array<EmptyObjectType>,
		default: () => [],
	},
	// Configuration Items
	config: {
		type: Object,
		default: () => {},
	},
});

// Define child components to pass values ​​to parent components/event
const emit = defineEmits(['delRow', 'pageChange', 'sortHeader']);

// Define variable content
const toolSetRef = ref();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const state = reactive({
	page: {
		pageNum: 1,
		pageSize: 10,
	},
	selectlist: [] as EmptyObjectType[],
	checkListAll: true,
	checkListIndeterminate: false,
});

// Set border display/hide
const setBorder = computed(() => {
	return props.config.isBorder ? true : false;
});
// Get the parent component Configuration Items（Must pass）
const getConfig = computed(() => {
	return props.config;
});
// set up tool header data
const setHeader = computed(() => {
	return props.header.filter((v) => v.isCheck);
});
// tool When the column display select all changes
const onCheckAllChange = <T>(val: T) => {
	if (val) props.header.forEach((v) => (v.isCheck = true));
	else props.header.forEach((v) => (v.isCheck = false));
	state.checkListIndeterminate = false;
};
// tool When the column displays the current item changes
const onCheckChange = () => {
	const headers = props.header.filter((v) => v.isCheck).length;
	state.checkListAll = headers === props.header.length;
	state.checkListIndeterminate = headers > 0 && headers < props.header.length;
};
// When multiple selections of tables are changed，For export
const onSelectionChange = (val: EmptyObjectType[]) => {
	state.selectlist = val;
};
// Delete the current item
const onDelRow = (row: EmptyObjectType) => {
	emit('delRow', row);
};
// Page changes
const onHandleSizeChange = (val: number) => {
	state.page.pageSize = val;
	emit('pageChange', state.page);
};
// Page changes
const onHandleCurrentChange = (val: number) => {
	state.page.pageNum = val;
	emit('pageChange', state.page);
};
// When searching，Restore the page to default
const pageReset = () => {
	state.page.pageNum = 1;
	state.page.pageSize = 10;
	emit('pageChange', state.page);
};
// Export
const onImportTable = () => {
	if (state.selectlist.length <= 0) return ElMessage.warning('Please select the data to export first');
	table2excel(props.header, state.selectlist, `${themeConfig.value.globalTitle} ${new Date().toLocaleString()}`);
};
// refresh
const onRefreshTable = () => {
	emit('pageChange', state.page);
};
// set up
const onSetTable = () => {
	nextTick(() => {
		const sortable = Sortable.create(toolSetRef.value, {
			handle: '.handle',
			dataIdAttr: 'data-key',
			animation: 150,
			onEnd: () => {
				const headerList: EmptyObjectType[] = [];
				sortable.toArray().forEach((val) => {
					props.header.forEach((v) => {
						if (v.key === val) headerList.push({ ...v });
					});
				});
				emit('sortHeader', headerList);
			},
		});
	});
};

// Expose variables
defineExpose({
	pageReset,
});
</script>

<style scoped lang="scss">
.table-container {
	display: flex;
	flex-direction: column;
	.el-table {
		flex: 1;
	}
	.table-footer {
		display: flex;
		.table-footer-tool {
			flex: 1;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			i {
				margin-right: 10px;
				cursor: pointer;
				color: var(--el-text-color-regular);
				&:last-of-type {
					margin-right: 0;
				}
			}
		}
	}
}
</style>
