import {dict} from "@fast-crud/fast-crud";
import {shallowRef} from 'vue'
import deptFormat from "/@/components/dept-format/index.vue";

export const commonCrudConfig = (options = {
    create_datetime: {
        form: false,
        table: false,
        search: false
    },
    update_datetime: {
        form: false,
        table: false,
        search: false
    },
    creator_name: {
        form: false,
        table: false,
        search: false
    },
    modifier_name: {
        form: false,
        table: false,
        search: false
    },
    dept_belong_id: {
        form: false,
        table: false,
        search: false
    },
    description: {
        form: false,
        table: false,
        search: false
    },
}) => {
    return {
        dept_belong_id: {
            title: 'Department',
            type: 'dict-tree',
            search: {
                show: options.dept_belong_id?.search || false
            },
            dict: dict({
                url: '/api/system/dept/all_dept/',
                isTree: true,
                value: 'id',
                label: 'name',
                children: 'children',
            }),
            column: {
                align: 'center',
                width: 300,
                show: options.dept_belong_id?.table || false,
                component: {
                    name: shallowRef(deptFormat),
                    vModel: "modelValue",
                }
            },
            form: {
                show: options.dept_belong_id?.form || false,
                component: {
                    multiple: false,
                    clearable: true,
                    props: {
                        checkStrictly: true,
                        props: {
                            // Why do I have to write two layers hereprops
                            // becausepropsAttribute name andfsDynamic rendering ofpropsNaming conflict，So write one more layer
                            label: "name",
                            value: "id",
                        }
                    }
                },
                helper: "If the default is not filled in, it will be the department where the user is currently created.ID"
            }
        },
        description: {
            title: 'Remark',
            search: {
                show: options.description?.search || false
            },
            type: 'textarea',
            column: {
                width: 100,
                show: options.description?.table || false,
            },
            form: {
                show: options.description?.form || false,
                component: {
                    placeholder: 'Please enter content',
                    showWordLimit: true,
                    maxlength: '200',
                }
            },
            viewForm: {
                show: true
            }
        },
        modifier_name: {
            title: 'Modify',
            search: {
                show: options.modifier_name?.search || false
            },
            column: {
                width: 100,
                show: options.modifier_name?.table || false,
            },
            form: {
                show: false,
            },
            viewForm: {
                show: true
            }
        },
        creator_name: {
            title: 'Founder',
            search: {
                show: options.creator_name?.search || false
            },
            column: {
                width: 100,
                show: options.creator_name?.table || false,
            },
            form: {
                show: false,
            },
            viewForm: {
                show: true
            }
        },
        update_datetime: {
            title: 'Update time',
            type: 'datetime',
            search: {
                show: options.update_datetime?.search || false,
                col: {span: 8},
                component: {
                    type: 'datetimerange',
                    props: {
                        'start-placeholder': 'Start time',
                        'end-placeholder': 'End time',
                        'value-format': 'YYYY-MM-DD HH:mm:ss',
                        'picker-options': {
                            shortcuts: [{
                                text: 'The last week',
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                    picker.$emit('pick', [start, end]);
                                }
                            }, {
                                text: 'The last month',
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                    picker.$emit('pick', [start, end]);
                                }
                            }, {
                                text: 'The last three months',
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                    picker.$emit('pick', [start, end]);
                                }
                            }]
                        }
                    }
                },
                valueResolve(context: any) {
                    const {key, value} = context
                    //valueAnalysis，It is to convert the value of the component into the value required in the background
                    //existformAfter clicking the save button on the form，Perform conversion before submitting to the background
                    if (value) {
                        context.form.update_datetime_after = value[0]
                        context.form.update_datetime_before = value[1]
                    }
                    //  ↑↑↑↑↑ Note that this isform，norow
                }
            },
            column: {
                width: 160,
                show: options.update_datetime?.table || false,
            },
            form: {
                show: false,
            },
            viewForm: {
                show: true
            }
        },
        create_datetime: {
            title: 'Creation time',
            type: 'datetime',
            search: {
                show: options.create_datetime?.search || false,
                col: {span: 8},
                component: {
                    type: 'datetimerange',
                    props: {
                        'start-placeholder': 'Start time',
                        'end-placeholder': 'End time',
                        'value-format': 'YYYY-MM-DD HH:mm:ss',
                        'picker-options': {
                            shortcuts: [{
                                text: 'The last week',
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                                    picker.$emit('pick', [start, end]);
                                }
                            }, {
                                text: 'The last month',
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                                    picker.$emit('pick', [start, end]);
                                }
                            }, {
                                text: 'The last three months',
                                onClick(picker) {
                                    const end = new Date();
                                    const start = new Date();
                                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                                    picker.$emit('pick', [start, end]);
                                }
                            }]
                        }
                    }
                },
                valueResolve(context: any) {
                    const {key, value} = context
                    //valueAnalysis，It is to convert the value of the component into the value required in the background
                    //existformAfter clicking the save button on the form，Perform conversion before submitting to the background
                    if (value) {
                        context.form.create_datetime_after = value[0]
                        context.form.create_datetime_before = value[1]
                    }
                    //  ↑↑↑↑↑ Note that this isform，norow
                }
            },
            column: {
                width: 160,
                show: options.create_datetime?.table || false,
            },
            form: {
                show: false
            },
            viewForm: {
                show: true
            }
        }
    }
}
