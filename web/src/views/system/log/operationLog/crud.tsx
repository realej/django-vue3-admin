import * as api from './api';
import { UserPageQuery, AddReq, DelReq, EditReq, CrudExpose, CrudOptions, CreateCrudOptionsProps, CreateCrudOptionsRet } from '@fast-crud/fast-crud';

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
						show: false,
					},
				},
			},
			rowHandle: {
				fixed:'right',
				width: 100,
				buttons: {
					view: {
						type: 'text',
					},
					edit: {
						show: false,
					},
					remove: {
						show: false,
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
							return ((pagination!.currentPage ?? 1) - 1) * pagination!.pageSize + index + 1;
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
				request_modular: {
					title: 'Request module',
					search: {
						disabled: false,
					},
					type: 'input',
					column:{
						minWidth: 100,
					},
					form: {
						disabled: true,
						component: {
							placeholder: 'Please enter the request module',
						},
					},
				},
				request_path: {
					title: 'Request address',
					search: {
						disabled: false,
					},
					type: 'input',
					column:{
						minWidth: 200,
					},
					form: {
						disabled: true,
						component: {
							placeholder: 'Please enter the request address',
						},
					},
				},
				request_body: {
					column: {
						showOverflowTooltip: true,
						width: 200, //Column width
						minWidth: 100, //Minimum column width
					},
					title: 'Request parameters',
					search: {
						disabled: true,
					},
					disabled: true,
					type: 'textarea',
					form: {
						component: {
							props: {
								type: 'textarea',
							},
							autosize: {
								minRows: 2,
								maxRows: 8,
							},
							placeholder: 'Please enter keywords',
						},
					},
				},
				request_method: {
					title: 'Request method',
					type: 'input',
					search: {
						disabled: false,
					},
					column:{
						minWidth: 100,
					},
					form: {
						disabled: true,
						component: {
							placeholder: 'Please enter the request method',
						},
					},
					component: { props: { color: 'auto' } }, // Automatic staining
				},
				request_msg: {
					title: 'Operation Instructions',
					disabled: true,
					form: {
						component: {
							span: 12,
						},
					},
				},
				request_ip: {
					title: 'IPaddress',
					search: {
						disabled: false,
					},
					type: 'input',
					column:{
						minWidth: 100,
					},
					form: {
						disabled: true,
						component: {
							placeholder: 'Please enterIPaddress',
						},
					},
					component: { props: { color: 'auto' } }, // Automatic staining
				},
				request_browser: {
					title: 'Request a browser',
					type: 'input',
					column:{
						minWidth: 120,
					},
					form: {
						disabled: true,
					},
					component: { props: { color: 'auto' } }, // Automatic staining
				},
				response_code: {
					title: 'Response code',
					search: {
						disabled: true,
					},
					type: 'input',
					column:{
						minWidth: 100,
					},
					form: {
						disabled: true,
					},
					component: { props: { color: 'auto' } }, // Automatic staining
				},
				request_os: {
					title: 'operating system',
					disabled: true,
					search: {
						disabled: true,
					},
					type: 'input',
					column:{
						minWidth: 120,
					},
					form: {
						disabled: true,
					},
					component: { props: { color: 'auto' } }, // Automatic staining
				},
				json_result: {
					title: 'Return information',
					search: {
						disabled: true,
					},
					type: 'input',
					column:{
						minWidth: 150,
					},
					form: {
						disabled: true,
					},
					component: { props: { color: 'auto' } }, // Automatic staining
				},
				creator_name: {
					title: 'Operator',
					column:{
						minWidth: 100,
					},
					form: {
						disabled: true,
					},
				},
			},
		},
	};
};
