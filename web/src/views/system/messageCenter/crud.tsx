import * as api from './api';
import { dict, useCompute, PageQuery, AddReq, DelReq, EditReq, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';
import tableSelector from '/@/components/tableSelector/index.vue';
import { shallowRef, computed } from 'vue';
import manyToMany from '/@/components/manyToMany/index.vue';
import { auth } from '/@/utils/authFunction';
const { compute } = useCompute();

export default function ({ crudExpose, context }: CreateCrudOptionsProps): CreateCrudOptionsRet {
	const { tabActivted } = context; //fromcontextGet it intabActivted

	const pageRequest = async (query: PageQuery) => {
		if (tabActivted.value === 'receive') {
			return await api.GetSelfReceive(query);
		}
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

	const viewRequest = async ({ row }: { row: any }) => {
		return await api.GetObj(row.id);
	};

	const IsReadFunc = computed(() => {
		return tabActivted.value === 'receive';
	});

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
						show: computed(() => {
							return tabActivted.value !== 'receive' && auth('messageCenter:Create');
						}),
					},
				},
			},
			rowHandle: {
				fixed: 'right',
				width: 150,
				buttons: {
					edit: {
						show: false,
					},
					view: {
						text: 'Check',
						type: 'text',
						iconRight: 'View',
						show: auth('messageCenter:Search'),
						click({ index, row }) {
							crudExpose.openView({ index, row });
							if (tabActivted.value === 'receive') {
								viewRequest({ row });
								crudExpose.doRefresh();
							}
						},
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
						show: auth('messageCenter:Delete'),
					},
				},
			},
			columns: {
				id: {
					title: 'id',
					form: {
						show: false,
					},
				},
				title: {
					title: 'title',
					search: {
						show: true,
					},
					type: ['text', 'colspan'],
					column: {
						minWidth: 120,
					},
					form: {
						rules: [
							// Form verification rules
							{
								required: true,
								message: 'Required',
							},
						],
						component: { span: 24, placeholder: 'Please enter a title' },
					},
				},
				is_read: {
					title: 'Have you read it',
					type: 'dict-select',
					column: {
						show: IsReadFunc.value,
					},
					dict: dict({
						data: [
							{ label: 'Read', value: true, color: 'success' },
							{ label: 'Not read', value: false, color: 'danger' },
						],
					}),
					form: {
						show: false,
					},
				},
				target_type: {
					title: 'Target Type',
					type: ['dict-radio', 'colspan'],
					column: {
						minWidth: 120,
					},
					dict: dict({
						data: [
							{ value: 0, label: 'By user' },
							{ value: 1, label: 'By role' },
							{
								value: 2,
								label: 'By department',
							},
							{ value: 3, label: 'Notices and Announcements' },
						],
					}),
					form: {
						component: {
							optionName: 'el-radio-button',
						},
						rules: [
							{
								required: true,
								message: 'Must-have options',
								// @ts-ignore
								trigger: ['blur', 'change'],
							},
						],
					},
				},
				target_user: {
					title: 'Target user',
					search: {
						disabled: true,
					},
					form: {
						component: {
							name: shallowRef(tableSelector),
							vModel: 'modelValue',
							displayLabel: compute(({ row }) => {
								if (row) {
									return row.user_info;
								}
								return null;
							}),
							tableConfig: {
								url: '/api/system/user/',
								label: 'name',
								value: 'id',
								isMultiple: true,
								columns: [
									{
										prop: 'name',
										label: 'Username',
										width: 120,
									},
									{
										prop: 'phone',
										label: 'User phone number',
										width: 120,
									},
								],
							},
						},
						show: compute(({ form }) => {
							return form.target_type === 0;
						}),
						rules: [
							// Form verification rules
							{
								required: true,
								message: 'Required',
							},
						],
					},
					column: {
						show: false,
						component: {
							name: shallowRef(manyToMany),
							vModel: 'modelValue',
							bindValue: compute(({ row }) => {
								return row.user_info;
							}),
							displayLabel: 'name',
						},
					},
				},
				target_role: {
					title: 'Target role',
					search: {
						disabled: true,
					},
					width: 130,
					form: {
						component: {
							name: shallowRef(tableSelector),
							vModel: 'modelValue',
							displayLabel: compute(({ row }) => {
								if (row) {
									return row.role_info;
								}
								return null;
							}),
							tableConfig: {
								url: '/api/system/role/',
								label: 'name',
								value: 'id',
								isMultiple: true,
								columns: [
									{
										prop: 'name',
										label: 'Role name',
									},
									{
										prop: 'key',
										label: 'Permission ID',
									},
								],
							},
						},
						show: compute(({ form }) => {
							return form.target_type === 1;
						}),
						rules: [
							// Form verification rules
							{
								required: true,
								message: 'Required',
							},
						],
					},
					column: {
						show: false,
						component: {
							name: shallowRef(manyToMany),
							vModel: 'modelValue',
							bindValue: compute(({ row }) => {
								return row.role_info;
							}),
							displayLabel: 'name',
						},
					},
				},
				target_dept: {
					title: 'Target Department',
					search: {
						disabled: true,
					},
					width: 130,
					type: 'table-selector',
					form: {
						component: {
							name: shallowRef(tableSelector),
							vModel: 'modelValue',
							displayLabel: compute(({ form }) => {
								return form.dept_info;
							}),
							tableConfig: {
								url: '/api/system/dept/all_dept/',
								label: 'name',
								value: 'id',
								isTree: true,
								isMultiple: true,
								columns: [
									{
										prop: 'name',
										label: 'Department name',
										width: 150,
									},
									{
										prop: 'status_label',
										label: 'state',
									},
									{
										prop: 'parent_name',
										label: 'Parent department',
									},
								],
							},
						},
						show: compute(({ form }) => {
							return form.target_type === 2;
						}),
						rules: [
							// Form verification rules
							{
								required: true,
								message: 'Required',
							},
						],
					},
					column: {
						show: false,
						component: {
							name: shallowRef(manyToMany),
							vModel: 'modelValue',
							bindValue: compute(({ row }) => {
								return row.dept_info;
							}),
							displayLabel: 'name',
						},
					},
				},
				content: {
					title: 'content',
					column: {
						width: 300,
						show: false,
					},
					type: ['editor-wang5', 'colspan'],
					form: {
						rules: [
							// Form verification rules
							{
								required: true,
								message: 'Required',
							},
						],
						component: {
							disabled: false,
							id: '1', // When there are multiple pageseditorhour，Need to configure differentlyid
							editorConfig: {
								// Read only
								readOnly: compute((context) => {
									const { mode } = context;
									if (mode === 'add') {
										return false;
									}
									return true;
								}),
							},
							uploader: {
								type: 'form',
								buildUrl(res: any) {
									return res.url;
								},
							},
						},
					},
				},
			},
		},
	};
}
