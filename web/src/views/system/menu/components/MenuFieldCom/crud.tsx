import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { request } from '/@/utils/service';
import { dictionary } from '/@/utils/dictionary';
import { inject, nextTick, ref } from 'vue';
import {auth} from "/@/utils/authFunction";
import XEUtils from 'xe-utils';



export const createCrudOptions = function ({ crudExpose, props,modelDialog,selectOptions,allModelData }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: UserPageQuery) => {
		// return await api.GetList(query);
		if (selectOptions.value.id) {
			return await api.GetList({ menu: selectOptions.value.id } as any);
		} else {
			return undefined;
		}
	};
	const editRequest = async ({ form, row }: EditReq) => {
		form.id = row.id;
		return await api.UpdateObj(form);
	};
	const delRequest = async ({ row }: DelReq) => {
		return await api.DelObj(row.id);
	};
	const addRequest = async ({ form }: AddReq) => {
		form.menu = selectOptions.value.id;
		return await api.AddObj(form);
	};
// Record the selected row
const selectedRows = ref<any>([]);

const onSelectionChange = (changed: any) => {
	const tableData = crudExpose.getTableData();
	const unChanged = tableData.filter((row: any) => !changed.includes(row));
	// Add selected rows
	XEUtils.arrayEach(changed, (item: any) => {
		const ids = XEUtils.pluck(selectedRows.value, 'id');
		if (!ids.includes(item.id)) {
			selectedRows.value = XEUtils.union(selectedRows.value, [item]);
		}
	});
	// Exclude unselected rows
	XEUtils.arrayEach(unChanged, (unItem: any) => {
		selectedRows.value = XEUtils.remove(selectedRows.value, (item: any) => item.id !== unItem.id);
	});
};
const toggleRowSelection = () => {
	// After multiple choices，Echo the default check
	const tableRef = crudExpose.getBaseTableRef();
	const tableData = crudExpose.getTableData();
	const selected = XEUtils.filter(tableData, (item: any) => {
		const ids = XEUtils.pluck(selectedRows.value, 'id');
		return ids.includes(item.id);
	});

	nextTick(() => {
		XEUtils.arrayEach(selected, (item) => {
			tableRef.toggleRowSelection(item, true);
		});
	});
};
	return {
		selectedRows,
		crudOptions: {
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
			},
			pagination: {
				show: false,
			},
			actionbar: {
				buttons: {
					add:{
						show:auth('column:Create')
					},
					auto: {
						text: 'Automatic matching',
						type: 'success',
						show:auth('column:Match'),
						click: () => {
							return modelDialog.value=true;
						},
					},
				},
			},
			rowHandle: {
				//Fix the right side
				fixed: 'right',
				buttons: {
					view: {
						show: false,
					},
					edit: {
						show: auth('column:Update')
					},
					remove: {
						show: auth('column:Delete')
					},
				},
			},
			form: {
				col: { span: 24 },
				labelWidth: '110px',
				wrapper: {
					is: 'el-dialog',
					width: '600px',
				},
			},
			table: {
				rowKey: 'id', //Set your primary keyid， defaultrowKey=id
				onSelectionChange,
				onRefreshed: () => toggleRowSelection(),
			},
			columns: {
				$checked: {
					title: 'choose',
					form: { show: false },
					column: {
						type: 'selection',
						align: 'center',
						width: '70px',
						columnSetDisabled: true, //Disable selection in column settings
					},
				},
				_index: {
					title: 'Serial number',
					form: { show: false },
					column: {
						//type: 'index',
						align: 'center',
						width: '70px',
						columnSetDisabled: true, //Disable selection in column settings
						//@ts-ignore
						formatter: (context) => {
							//Calculate the serial number,You can customize calculation rules，Here is the page recapture
							let index = context.index ?? 1;
							let pagination: any = crudExpose!.crudBinding.value.pagination;
							return ((pagination.currentPage ?? 1) - 1) * pagination.pageSize + index + 1;
						},
					},
				},
				model: {
					title: 'model',
					type: 'dict-select',
					dict:dict({
						url:'/api/system/column/get_models/',
						label:'title',
						value:'key'
					}),
					column:{
						sortable: true,
					},
					form: {
						rules: [
							// Form verification rules
							{
								required: true,
								message: 'Required',
							},
						],
						component: {
							span: 12,
							showSearch: true,
							filterable: true,
							//DefaultfilterOptionSupported onlyvalueFilter of，labelWill not join the query
							//So customization is requiredfilterOption
							filterOption(inputValue, option) {
								return option.label.indexOf(inputValue) >= 0 || option.value.indexOf(inputValue) >= 0;
							}
						},
					},
				},
				title: {
					title: 'Chinese name',
					sortable: 'custom',
					search: {
						show: true,
					},
					type: 'text',
					form: {
						rules: [
							// Form verification rules
							{
								required: true,
								message: 'Required',
							},
						],
						component: {
							span: 12,
							placeholder: 'Please enter your Chinese name',
						},
					},
				},
				field_name: {
					title: 'Field name',
					type: 'text',
					search: {
						show: true,
					},
					column:{
						sortable: true,
					},
					form: {
						rules: [
							// Form verification rules
							{
								required: true,
								message: 'Required',
							},
						],
						component: {
							span: 12,
							placeholder: 'Please enter a field name',
						},
					},
				},
			},
		},
	};
};
