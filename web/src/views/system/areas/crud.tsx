import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '/@/utils/message';
import { auth } from '/@/utils/authFunction';
import tableSelector from '/@/components/tableSelector/index.vue';
import { shallowRef } from 'vue';

export const createCrudOptions = function ({ crudExpose }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: UserPageQuery) => {
		return await api.GetList(query);
	};
	const editRequest = async ({ form, row }: EditReq) => {
		form.id = row.id;
		return await api.UpdateObj(form);
	};
	const delRequest = async ({ row }: DelReq) => {
		return await api.DelObj(row.id);
	};
	const addRequest = async ({ form }: AddReq) => {
		return await api.AddObj(form);
	};

	/**
	 * Lazy loading
	 * @param row
	 * @returns {Promise<unknown>}
	 */
	const loadContentMethod = (tree: any, treeNode: any, resolve: Function) => {
		pageRequest({ pcode: tree.code }).then((res: APIResponseData) => {
			resolve(res.data);
		});
	};

	return {
		crudOptions: {
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
			},
			actionbar: {
				buttons: {
					add: {
						show: auth('area:Create'),
					},
				},
			},
			rowHandle: {
				//Fix the right side
				fixed: 'right',
				width: 200,
				buttons: {
					view: {
						show: false,
					},
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('area:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('area:Delete'),
					},
				},
			},
			pagination: {
				show: false,
			},
			table: {
				rowKey: 'id',
				lazy: true,
				load: loadContentMethod,
				treeProps: { children: 'children', hasChildren: 'hasChild' },
			},
			columns: {
				_index: {
					title: 'Serial number',
					form: { show: false },
					column: {
						type: 'index',
						align: 'center',
						width: '70px',
						columnSetDisabled: true, //Disable selection in column settings
					},
				},
				name: {
					title: 'name',
					search: {
						show: true,
					},
					treeNode: true,
					type: 'input',
					column: {
						minWidth: 120,
					},
					form: {
						rules: [
							// Form verification rules
							{ required: true, message: 'Name required' },
						],
						component: {
							placeholder: 'Please enter a name',
						},
					},
				},
				pcode: {
					title: 'Parent Region',
					search: {
						disabled: true,
					},
					width: 130,
					type: 'table-selector',
					form: {
						component: {
							name: shallowRef(tableSelector),
							vModel: 'modelValue',
							displayLabel: compute(({ row }) => {
								if (row) {
									return row.pcode_info;
								}
								return null;
							}),
							tableConfig: {
								url: '/api/system/area/',
								label: 'name',
								value: 'id',
								isTree: true,
								isMultiple: false,
								lazy: true,
								load: loadContentMethod,
								treeProps: { children: 'children', hasChildren: 'hasChild' },
								columns: [
									{
										prop: 'name',
										label: 'area',
										width: 150,
									},
									{
										prop: 'code',
										label: 'Regional code',
									},
								],
							},
						},
					},
					column: {
						show: false,
					},
				},
				code: {
					title: 'Regional code',
					search: {
						show: true,
					},
					type: 'input',
					column: {
						minWidth: 90,
					},
					form: {
						rules: [
							// Form verification rules
							{ required: true, message: 'Required area code' },
						],
						component: {
							placeholder: 'Please enter the region code',
						},
					},
				},
				enable: {
					title: 'Whether to enable',
					search: {
						show: true,
					},
					type: 'dict-radio',
					column: {
						minWidth: 90,
						component: {
							name: 'fs-dict-switch',
							activeText: '',
							inactiveText: '',
							style: '--el-switch-on-color: var(--el-color-primary); --el-switch-off-color: #dcdfe6',
							onChange: compute((context) => {
								return () => {
									api.UpdateObj(context.row).then((res: APIResponseData) => {
										successMessage(res.msg as string);
									});
								};
							}),
						},
					},
					dict: dict({
						data: dictionary('button_status_bool'),
					}),
				},
			},
		},
	};
};
