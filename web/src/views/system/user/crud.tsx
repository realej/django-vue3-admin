import * as api from './api';
import {
    dict,
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    compute,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet
} from '@fast-crud/fast-crud';
import { request } from '/@/utils/service';
import { dictionary } from '/@/utils/dictionary';
import { successMessage } from '/@/utils/message';
import { auth } from '/@/utils/authFunction';
import { SystemConfigStore } from "/@/stores/systemConfig";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { Md5 } from 'ts-md5';
import { commonCrudConfig } from "/@/utils/commonCrud";
import { ElMessageBox } from 'element-plus';
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

    const exportRequest = async (query: UserPageQuery) => {
        return await api.exportData(query)
    }

    const resetToDefaultPasswordRequest = async (row: EditReq) => {
        await api.resetToDefaultPassword(row.id)
        successMessage("Password reset successfully")
    }

    const systemConfigStore = SystemConfigStore()
    const { systemConfig } = storeToRefs(systemConfigStore)
    const getSystemConfig = computed(() => {
        // console.log(systemConfig.value)
        return systemConfig.value
    })


    return {
        crudOptions: {
            table: {
                remove: {
                    confirmMessage: 'Whether to delete the user？',
                },
            },
            request: {
                pageRequest,
                addRequest,
                editRequest,
                delRequest,
            },
            form: {
                initialForm: {
                    password: computed(() => {
                        return systemConfig.value['base.default_password']
                    }),
                }
            },
            actionbar: {
                buttons: {
                    add: {
                        show: auth('user:Create')
                    },
                    export: {
                        text: "Export",//Button text
                        title: "Export",//The information displayed by the mouse stay
                        show: auth('user:Export'),
                        click: (ctx: any) => ElMessageBox.confirm(
                            'Are you sure to reset your password?？', 'hint',
                            { confirmButtonText: 'Sure', cancelButtonText: 'Cancel', type: 'warning' }
                        ).then(() => resetToDefaultPasswordRequest(ctx.row))
                    }
                }
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
                        show: auth('user:Update'),
                    },
                    remove: {
                        iconRight: 'Delete',
                        type: 'text',
                        show: auth('user:Delete'),
                    },
                    custom: {
                        text: 'Reset password',
                        type: 'text',
                        show: auth('user:ResetPassword'),
                        tooltip: {
                            placement: 'top',
                            content: 'Reset password',
                        },
                        //@ts-ignore
                        click: (ctx: any) => {
                            const { row } = ctx;
                            resetToDefaultPasswordRequest(row)
                        },
                    },
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
                username: {
                    title: 'account',
                    search: {
                        show: true,
                    },
                    type: 'input',
                    column: {
                        minWidth: 100, //Minimum column width
                    },
                    form: {
                        rules: [
                            // Form verification rules
                            {
                                required: true,
                                message: 'Required account number',
                            },
                        ],
                        component: {
                            placeholder: 'Please enter your account number',
                        },
                    },
                },
                password: {
                    title: 'password',
                    type: 'password',
                    column: {
                        show: false,
                    },
                    editForm: {
                        show: false,
                    },
                    form: {
                        rules: [
                            // Form verification rules
                            {
                                required: true,
                                message: 'Password Required',
                            },
                        ],
                        component: {

                            span: 12,
                            showPassword: true,
                            placeholder: 'Please enter your password',
                        },
                    },
                    valueResolve({ form }) {
                        if (form.password) {
                            form.password = Md5.hashStr(form.password)
                        }
                    }
                },
                name: {
                    title: 'Name',
                    search: {
                        show: true,
                    },
                    type: 'input',
                    column: {
                        minWidth: 100, //Minimum column width
                    },
                    form: {
                        rules: [
                            // Form verification rules
                            {
                                required: true,
                                message: 'Required name',
                            },
                        ],
                        component: {
                            span: 12,
                            placeholder: 'Please enter a name',
                        },
                    },
                },
                dept: {
                    title: 'department',
                    search: {
                        disabled: true,
                    },
                    type: 'dict-tree',
                    dict: dict({
                        isTree: true,
                        url: '/api/system/dept/all_dept/',
                        value: 'id',
                        label: 'name'
                    }),
                    column: {
                        minWidth: 200, //Minimum column width
                        formatter({ value, row, index }) {
                            return row.dept_name_all
                        }
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
                            filterable: true,
                            placeholder: 'Please select',
                            props: {
                                checkStrictly: true,
                                props: {
                                    value: 'id',
                                    label: 'name',
                                },
                            },
                        },
                    },
                },
                role: {
                    title: 'Role',
                    search: {
                        disabled: true,
                    },
                    type: 'dict-select',
                    dict: dict({
                        url: '/api/system/role/',
                        value: 'id',
                        label: 'name',
                    }),
                    column: {
                        minWidth: 200, //Minimum column width
                        // formatter({ value, row, index }) {
                        //     const values = row.role_info.map((item: any) => item.name);
                        //     return values.join(',')
                        // }
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
                            multiple: true,
                            filterable: true,
                            placeholder: 'Please select a role',
                        },
                    },
                },
                mobile: {
                    title: 'phone number',
                    search: {
                        show: true,
                    },
                    type: 'input',
                    column: {
                        minWidth: 120, //Minimum column width
                    },
                    form: {
                        rules: [
                            {
                                max: 20,
                                message: 'Please enter the correct mobile phone number',
                                trigger: 'blur',
                            },
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: 'Please enter the correct mobile phone number',
                            },
                        ],
                        component: {
                            placeholder: 'Please enter your mobile phone number',
                        },
                    },
                },
                email: {
                    title: 'Mail',
                    column: {
                        width: 260,
                    },
                    form: {
                        rules: [
                            {
                                type: 'email',
                                message: 'Please enter the correct email address',
                                trigger: ['blur', 'change'],
                            },
                        ],
                        component: {
                            placeholder: 'Please enter your email address',
                        },
                    },
                },
                gender: {
                    title: 'gender',
                    type: 'dict-select',
                    dict: dict({
                        data: dictionary('gender'),
                    }),
                    form: {
                        value: 1,
                        component: {
                            span: 12,
                        },
                    },
                    component: { props: { color: 'auto' } }, // Automatic staining
                },
                user_type: {
                    title: 'User Type',
                    search: {
                        show: true,
                    },
                    type: 'dict-select',
                    dict: dict({
                        data: dictionary('user_type'),
                    }),
                    column: {
                        minWidth: 100, //Minimum column width
                    },
                    form: {
                        show: false,
                        value: 0,
                        component: {
                            span: 12,
                        },
                    },
                },
                is_active: {
                    title: 'state',
                    search: {
                        show: true,
                    },
                    type: 'dict-radio',
                    column: {
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
                avatar: {
                    title: 'avatar',
                    type: 'avatar-uploader',
                    align: 'center',
                    form: {
                        show: false,
                    },
                    column: {
                        minWidth: 100, //Minimum column width
                    },
                },
                ...commonCrudConfig({
                    dept_belong_id: {
                        form: true,
                        table: true
                    }
                })
            },
        },
    };
};
