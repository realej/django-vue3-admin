import { CrudOptions, AddReq, DelReq, EditReq, dict, CrudExpose, compute } from '@fast-crud/fast-crud';
import * as api from './api';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '../../../utils/message';
import { auth } from '/@/utils/authFunction'

interface CreateCrudOptionsTypes {
    output: any;
    crudOptions: CrudOptions;
}

//Here iscrudOptionsConfiguration
export const createCrudOptions = function ({ crudExpose }: { crudExpose: CrudExpose; }): CreateCrudOptionsTypes {
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

    //Permission determination

    // @ts-ignore
    // @ts-ignore
    return {
        crudOptions: {
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            pagination: {
                show: true
            },
            actionbar: {
                buttons: {
                    add: {
                        show: false
                    }
                }
            },
            toolbar: {
                buttons: {
                    export: {
                        show: false
                    }
                }
            },
            rowHandle: {
                //Fix the right side
                fixed: 'right',
                width: 120,
                buttons: {
                    view: {
                        show: false
                    },
                    edit: {
                        show: false
                    },
                    remove: {
                        show: false
                    },
                    download: {
                        show: compute(ctx => ctx.row.task_status === 2),
                        text: 'Download the file',
                        type: 'warning',
                        click: (ctx) => window.open(ctx.row.url, '_blank')
                    }
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
                task_name: {
                    title: 'Task name',
                    type: 'text',
                    column: {
                        minWidth: 160,
                        align: 'left'
                    },
                    search: {
                        show: true
                    }
                },
                file_name: {
                    title: 'file name',
                    type: 'text',
                    column: {
                        minWidth: 160,
                        align: 'left'
                    },
                    search: {
                        show: true
                    }
                },
                size: {
                    title: 'File size(b)',
                    type: 'number',
                    column: {
                        width: 100
                    }
                },
                task_status: {
                    title: 'Task status',
                    type: 'dict-select',
                    dict: dict({
                        data: [
                            { label: 'Task created', value: 0 },
                            { label: 'The task is in progress', value: 1 },
                            { label: 'Task completion', value: 2 },
                            { label: 'Mission failed', value: 3 },
                        ]
                    }),
                    column: {
                        width: 120
                    },
                    search: {
                        show: true
                    }
                },
                create_datetime: {
                    title: 'Creation time',
                    column: {
                        width: 160
                    }
                },
                update_datetime: {
                    title: 'Creation time',
                    column: {
                        width: 160
                    }
                }
            },
        },
    };
};
