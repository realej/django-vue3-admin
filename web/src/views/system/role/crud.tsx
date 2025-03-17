import { CreateCrudOptionsProps, CreateCrudOptionsRet, AddReq, DelReq, EditReq, dict, compute } from '@fast-crud/fast-crud';
import * as api from './api';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '../../../utils/message';
import { auth } from '/@/utils/authFunction';

/**
 *
 * @param crudExpose：indexPassed example
 * @param context：indexPassed custom parameters
 * @returns
 */
export const createCrudOptions = function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const pageRequest = async (query: any) => {
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
			pagination: {
				show: true,
			},
			actionbar: {
				buttons: {
					add: {
						show: auth('role:Create'),
					},
				},
			},
			rowHandle: {
				//Fix the right side
				fixed: 'right',
				width: 320,
				buttons: {
					view: {
						show: true,
					},
					edit: {
						show: auth('role:Update'),
					},
					remove: {
						show: auth('role:Delete'),
					},
					permission: {
						type: 'primary',
						text: 'Permission configuration',
						show: auth('role:Permission'),
						click: (clickContext: any): void => {
							const { row } = clickContext;
							context.RoleDrawer.handleDrawerOpen(row);
							context.RoleMenuBtn.setState([]);
							context.RoleMenuField.setState([]);
						},
					},
				},
			},
			form: {
				col: { span: 24 },
				labelWidth: '100px',
				wrapper: {
					is: 'el-dialog',
					width: '600px',
				},
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
				id: {
					title: 'ID',
					column: { show: false },
					search: { show: false },
					form: { show: false },
				},
				name: {
					title: 'Role name',
					search: { show: true },
					column: {
						minWidth: 120,
						sortable: 'custom',
					},
					form: {
						rules: [{ required: true, message: 'Role name required' }],
						component: {
							placeholder: 'Please enter the role name',
						},
					},
				},
				key: {
					title: 'Permission ID',
					search: { show: false },
					column: {
						minWidth: 120,
						sortable: 'custom',
						columnSetDisabled: true,
					},
					form: {
						rules: [{ required: true, message: 'Permission ID required' }],
						component: {
							placeholder: 'Enter permission ID',
						},
					},
					valueBuilder(context) {
						const { row, key } = context;
						return row[key];
					},
				},
				sort: {
					title: 'Sort',
					search: { show: false },
					type: 'number',
					column: {
						minWidth: 90,
						sortable: 'custom',
					},
					form: {
						rules: [{ required: true, message: 'Required to sort' }],
						value: 1,
					},
				},
				status: {
					title: 'state',
					search: { show: true },
					type: 'dict-radio',
					column: {
						width: 100,
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
						value: dictionary('button_status_bool'),
					}),
				},
			},
		},
	};
};
