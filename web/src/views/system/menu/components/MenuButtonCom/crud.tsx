import {AddReq, DelReq, EditReq, dict, CreateCrudOptionsRet, CreateCrudOptionsProps} from '@fast-crud/fast-crud';
import * as api from './api';
import {auth} from '/@/utils/authFunction'
import {request} from '/@/utils/service';
import { successNotification } from '/@/utils/message';
import { ElMessage } from 'element-plus';
import { nextTick, ref } from 'vue';
import XEUtils from 'xe-utils';
//Here iscrudOptionsConfiguration
export const createCrudOptions = function ({crudExpose, context}: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const pageRequest = async () => {
        if (context!.selectOptions.value.id) {
            return await api.GetList({menu: context!.selectOptions.value.id} as any);
        } else {
            return undefined;
        }
    };
    const editRequest = async ({form, row}: EditReq) => {
        return await api.UpdateObj({...form, menu: row.menu});
    };
    const delRequest = async ({row}: DelReq) => {
        return await api.DelObj(row.id);
    };
    const addRequest = async ({form}: AddReq) => {
        return await api.AddObj({...form, ...{menu: context!.selectOptions.value.id}});
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
            pagination:{
                show:false
            },
            search: {
                container: {
                    action: {
                        //Button bar configuration
                        col: {
                            span: 8,
                        },
                    },
                },
            },
            actionbar: {
                buttons: {
                    add: {
                        show: auth('btn:Create')
                    },
                    batchAdd: {
						show: true,
						type: 'primary',
						text: 'Bulk generation',
						click: async () => {
							if (context!.selectOptions.value.id == undefined) {
								ElMessage.error('Please select menu');
								return;
							}
							const result = await api.BatchAdd({ menu: context!.selectOptions.value.id });
							if (result.code == 2000) {
								successNotification(result.msg);
								crudExpose.doRefresh();
							}
						},
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
                        icon: '',
                        type: 'primary',
                        show: auth('btn:Update')
                    },
                    remove: {
                        show: auth('btn:Delete')
                    },
                },
            },
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            table: {
				rowKey: 'id', //Set your primary keyid， defaultrowKey=id
				onSelectionChange,
				onRefreshed: () => toggleRowSelection(),
			},
            form: {
                col: {span: 24},
                labelWidth: '100px',
                wrapper: {
                    is: 'el-dialog',
                    width: '600px',
                },
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
                    form: {show: false},
                    column: {
                        type: 'index',
                        align: 'center',
                        width: '70px',
                        columnSetDisabled: true, //Disable selection in column settings
                    },
                },
                search: {
                    title: 'Keywords',
                    column: {show: false},
                    type: 'text',
                    search: {show: true},
                    form: {
                        show: false,
                        component: {
                            placeholder: 'Enter keyword search',
                        },
                    },
                },
                id: {
                    title: 'ID',
                    type: 'text',
                    column: {show: false},
                    search: {show: false},
                    form: {show: false},
                },
                name: {
                    title: 'Permission Name',
                    type: 'text',
                    search: {show: true},
                    column: {
                        minWidth: 120,
                        sortable: true,
                    },
                    form: {
                        rules: [{required: true, message: 'Permission name required'}],
                        component: {
                            placeholder: 'Enter permission name to search',
                            props: {
                                clearable: true,
                                allowCreate: true,
                                filterable: true,
                            },
                        },
                        helper: {
                            render() {
                                return <el-alert title="Manual input" type="warning"
                                                 description="The name of the button in the page or a custom name"/>;
                            },
                        },
                    },
                },
                value: {
                    title: 'Permission value',
                    type: 'text',
                    search: {show: false},
                    column: {
                        width: 200,
                        sortable: true,
                    },
                    form: {
                        rules: [{required: true, message: 'Permission ID required'}],
                        placeholder: 'Enter permission ID',
                        helper: {
                            render() {
                                return <el-alert title="Unique value" type="warning"
                                                 description="Used to determine the front-end button permissions or interface permissions"/>;
                            },
                        },
                    },
                },
                method: {
                    title: 'Request method',
                    search: {show: false},
                    type: 'dict-select',
                    column: {
                        width: 120,
                        sortable: true,
                    },
                    dict: dict({
                        data: [
                            {label: 'GET', value: 0},
                            {label: 'POST', value: 1, color: 'success'},
                            {label: 'PUT', value: 2, color: 'warning'},
                            {label: 'DELETE', value: 3, color: 'danger'},
                        ],
                    }),
                    form: {
                        rules: [{required: true, message: 'Required'}],
                    },
                },
                api: {
                    title: 'Interface address',
                    search: {show: false},
                    type: 'dict-select',
                    dict: dict({
                        getData() {
                            return request({url: '/swagger.json'}).then((res: any) => {
                                const ret = Object.keys(res.paths);
                                const data = [];
                                for (const item of ret) {
                                    const obj: any = {};
                                    obj.label = item;
                                    obj.value = item;
                                    data.push(obj);
                                }
                                return data;
                            });
                        },
                    }),
                    column: {
                        minWidth: 250,
                        sortable: true,
                    },
                    form: {
                        rules: [{required: true, message: 'Required'}],
                        component: {
                            props: {
                                allowCreate: true,
                                filterable: true,
                                clearable: true,
                            },
                        },
                        helper: {
                            render() {
                                return <el-alert title="Please fill in correctly，To avoid being intercepted during request。Match singletons using regular,For example:/api/xx/.*?/"
                                                 type="warning"/>;
                            },
                        },
                    },
                },
            },
        },
    };
};
