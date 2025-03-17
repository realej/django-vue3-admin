import * as api from './api';
import {
	UserPageQuery,
	AddReq,
	DelReq,
	EditReq,
	CrudExpose,
	CrudOptions,
	CreateCrudOptionsProps,
	CreateCrudOptionsRet,
	dict
} from '@fast-crud/fast-crud';
import fileSelector from '/@/components/fileSelector/index.vue';
import { shallowRef } from 'vue';

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
			actionbar: {
				buttons: {
					add: {
						show: true,
						click: () => context.openAddHandle?.()
					},
				},
			},
			request: {
				pageRequest,
				addRequest,
				editRequest,
				delRequest,
			},
			tabs: {
				show: true,
				name: 'file_type',
				type: '',
				options: [
					{ value: 0, label: 'picture' },
					{ value: 1, label: 'video' },
					{ value: 2, label: 'Audio' },
					{ value: 3, label: 'other' },
				]
			},
			rowHandle: {
				//Fix the right side
				fixed: 'right',
				width: 200,
				show: false,
				buttons: {
					view: {
						show: false,
					},
					edit: {
						iconRight: 'Edit',
						type: 'text',
					},
					remove: {
						iconRight: 'Delete',
						type: 'text',
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
				name: {
					title: 'File name',
					search: {
						show: true,
					},
					type: 'input',
					column: {
						minWidth: 200,
					},
					form: {
						component: {
							placeholder: 'Please enter the file name',
							clearable: true
						},
					},
				},
				preview: {
					title: 'Preview',
					column: {
						minWidth: 120,
						align: 'center'
					},
					form: {
						show: false
					}
				},
				url: {
					title: 'File address',
					type: 'file-uploader',
					search: {
						disabled: true,
					},
					column: {
						minWidth: 360,
					},
				},
				md5sum: {
					title: 'documentMD5',
					search: {
						disabled: true,
					},
					column: {
						minWidth: 300,
					},
					form: {
						disabled: false
					},
				},
				mime_type: {
					title: 'File Type',
					type: 'input',
					form: {
						show: false,
					},
					column: {
						minWidth: 160
					}
				},
				file_type: {
					title: 'File Type',
					type: 'dict-select',
					dict: dict({
						data: [
							{ label: 'picture', value: 0, color: 'success' },
							{ label: 'video', value: 1, color: 'warning' },
							{ label: 'Audio', value: 2, color: 'danger' },
							{ label: 'other', value: 3, color: 'primary' },
						]
					}),
					column: {
						show: false
					},
					search: {
						show: true
					},
					form: {
						show: false,
						component: {
							placeholder: 'Please select a file type'
						}
					}
				},
				size: {
					title: 'File size',
					column: {
						minWidth: 120
					},
					form: {
						show: false
					}
				},
				upload_method: {
					title: 'Upload method',
					type: 'dict-select',
					dict: dict({
						data: [
							{ label: 'Upload by default', value: 0, color: 'primary' },
							{ label: 'File selector upload', value: 1, color: 'warning' },
						]
					}),
					column: {
						minWidth: 140
					},
					search: {
						show: true
					}
				},
				create_datetime: {
					title: 'Creation time',
					column: {
						minWidth: 160
					},
					form: {
						show: false
					}
				},
				// fileselectortest: {
				// 	title: 'File selector test',
				// 	type: 'file-selector',
				// 	width: 200,
				// 	form: {
				// 		component: {
				// 			name: shallowRef(fileSelector),
				// 			vModel: 'modelValue',
				// 			tabsShow: 0b0100,
				// 			itemSize: 100,
				// 			multiple: false,
				// 			selectable: true,
				// 			showInput: true,
				// 			inputType: 'video',
				// 			valueKey: 'url',
				// 		}
				// 	}
				// }
			},
		},
	};
};
