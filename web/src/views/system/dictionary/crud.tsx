import * as api from './api';
import { dict, UserPageQuery, AddReq, DelReq, EditReq, compute, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import { dictionary } from '/@/utils/dictionary';
import { inject, nextTick, ref } from 'vue';
import { successMessage } from '/@/utils/message';
import {auth} from '/@/utils/authFunction';
export const createCrudOptions = function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
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


	return {
		crudOptions: {
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
			},
			rowHandle: {
				fixed: 'right',
				width: 200,
				buttons: {
					view: {
						show: false,
					},
					edit: {
						iconRight: 'Edit',
						type: 'text',
						show: auth('dictionary:Update'),
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('dictionary:Delete'),
					},
					custom: {
						text: 'Dictionary configuration',
						type: 'text',
						show: auth('dictionary:Update'),
						tooltip: {
							placement: 'top',
							content: 'Dictionary configuration',
						},
						//@ts-ignore
						click: (ctx: any) => {
							const { row } = ctx;
							context!.subDictRef.value.drawer = true;
							nextTick(() => {
								context!.subDictRef.value.setSearchFormData({ form: { parent: row.id } });
								context!.subDictRef.value.doRefresh();
							});
						},
					},
				},
			},
			columns: {
				_index: {
					title: 'Serial number',
					form: { show: false },
					column: {
						//type: 'index',
						align: 'center',
						width: '70px',
						columnSetDisabled: true, //Disable selection in column settings
						formatter: (context) => {
							//Calculate the serial number,You can customize calculation rules，Here is the page recapture
							let index = context.index ?? 1;
							let pagination = crudExpose!.crudBinding.value.pagination;
							// @ts-ignore
							return ((pagination.currentPage ?? 1) - 1) * pagination.pageSize + index + 1;
						},
					},
				},
				search: {
					title: 'Keywords',
					column: {
						show: false,
					},
					search: {
						show: true,
						component: {
							props: {
								clearable: true,
							},
							placeholder: 'Please enter keywords',
						},
					},
					form: {
						show: false,
						component: {
							props: {
								clearable: true,
							},
						},
					},
				},
				label: {
					title: 'Dictionary name',
					search: {
						show: true,
						component: {
							props: {
								clearable: true,
							},
						},
					},
					type: 'input',
					column: {
						minWidth: 120,
					},
					form: {
						rules: [
							// Form verification rules
							{ required: true, message: 'Required dictionary name' },
						],
						component: {
							props: {
								clearable: true,
							},
							placeholder: 'Please enter a dictionary name',
						},
					},
				},
				value: {
					title: 'Dictionary number',
					search: {
						disabled: true,
						component: {
							props: {
								clearable: true,
							},
						},
					},
					type: 'input',
					column: {
						minWidth: 120,
					},
					form: {
						rules: [
							// Form verification rules
							{ required: true, message: 'Dictionary number required' },
						],
						component: {
							props: {
								clearable: true,
							},
							placeholder: 'Please enter the dictionary number',
						},
						helper: {
							render(h) {
								return <el-alert title="How to use：dictionary('Dictionary number')" type="warning" />;
							},
						},
					},
				},
				status: {
					title: 'state',
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
				sort: {
					title: 'Sort',
					type: 'number',
					column: {
						minWidth: 80,
					},
					form: {
						value: 1,
					},
				},
			},
		},
	};
};
