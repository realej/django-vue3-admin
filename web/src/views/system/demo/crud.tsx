import * as api from './api';
import {
    UserPageQuery,
    AddReq,
    DelReq,
    EditReq,
    CreateCrudOptionsProps,
    CreateCrudOptionsRet,
    dict
} from '@fast-crud/fast-crud';
import {commonCrudConfig} from "/@/utils/commonCrud";
import {computed,shallowRef} from "vue";
import dvaSelect from "/@/components/dvaSelect/index.vue";
export const createCrudOptions = function ({
                                               crudExpose,
                                               isEcharts,
                                               initChart
                                           }: CreateCrudOptionsProps): CreateCrudOptionsRet {
    const pageRequest = async (query: UserPageQuery) => {
        return await api.GetList(query);
    };
    const editRequest = async ({form, row}: EditReq) => {
        form.id = row.id;
        return await api.UpdateObj(form);
    };
    const delRequest = async ({row}: DelReq) => {
        return await api.DelObj(row.id);
    };
    const addRequest = async ({form}: AddReq) => {
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
                        show: true,
                    },
                    showEcharts: {
                        type: 'warning',
                        text: computed(() => {
                            return isEcharts.value ? 'Hide chart' : 'Show charts'
                        }),
                        click: () => {
                            isEcharts.value = !isEcharts.value;
                        }
                    }
                },
            },
            rowHandle: {
                fixed: 'right',
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
                    form: {show: false},
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
                username: {
                    title: 'Test custom components',
                    dict:dict({
                        url({form}){
                            return  '/api/system/role/'
                        },
                        label:'name',
                        value:'id'
                        }),
                    form: {
                        component: {
                            //Local reference subtable，To useshallowRefpack
                            name: shallowRef(dvaSelect),
                        }
                    }
                },
                // username: {
                //     title: 'Login username',
                //     search: {
                //         disabled: false,
                //     },
                //     type: 'input',
                //     column: {
                //         minWidth: 120,
                //     },
                //     form: {
                //         disabled: true,
                //         component: {
                //             placeholder: 'Please enter the login username',
                //         },
                //     },
                // },
                ip: {
                    title: 'Log inip',
                    search: {
                        disabled: false,
                    },
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        disabled: true,
                        component: {
                            placeholder: 'Please enter loginip',
                        },
                    },
                },
                isp: {
                    title: 'Operator',
                    search: {
                        disabled: true,
                    },
                    disabled: true,
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter the operator',
                        },
                    },
                },
                continent: {
                    title: 'Dazhou',
                    type: 'input',
                    column: {
                        minWidth: 90,
                    },
                    form: {
                        disabled: true,
                        component: {
                            placeholder: 'Please enter Dazhou',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                country: {
                    title: 'nation',
                    type: 'input',
                    column: {
                        minWidth: 90,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter the country',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                province: {
                    title: 'province',
                    type: 'input',
                    column: {
                        minWidth: 80,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter the province',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                city: {
                    title: 'City',
                    type: 'input',
                    column: {
                        minWidth: 80,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter the city',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                district: {
                    title: 'County',
                    key: '',
                    type: 'input',
                    column: {
                        minWidth: 80,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter the county',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                area_code: {
                    title: 'Area Code',
                    type: 'input',
                    column: {
                        minWidth: 90,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter the area code',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                country_english: {
                    title: 'Full English name',
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter the full English name',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                country_code: {
                    title: 'Abbreviation',
                    type: 'input',
                    column: {
                        minWidth: 100,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter abbreviation',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                longitude: {
                    title: 'longitude',
                    type: 'input',
                    disabled: true,
                    column: {
                        minWidth: 100,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter longitude',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                latitude: {
                    title: 'latitude',
                    type: 'input',
                    disabled: true,
                    column: {
                        minWidth: 100,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter latitude',
                        },
                    },
                    component: {props: {color: 'auto'}}, // Automatic staining
                },
                login_type: {
                    title: 'Login Type',
                    type: 'dict-select',
                    search: {
                        disabled: false,
                    },
                    dict: dict({
                        data: [
                            {label: 'Normal login', value: 1},
                            {label: 'Scan the QR code to log in on WeChat', value: 2},
                        ],
                    }),
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: 'Please select the login type',
                        },
                    },
                },
                os: {
                    title: 'operating system',
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter the operating system',
                        },
                    },
                },
                browser: {
                    title: 'Browser name',
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enter your browser name',
                        },
                    },
                },
                agent: {
                    title: 'agentinformation',
                    disabled: true,
                    type: 'input',
                    column: {
                        minWidth: 120,
                    },
                    form: {
                        component: {
                            placeholder: 'Please enteragentinformation',
                        },
                    },
                },
                ...commonCrudConfig({
                    create_datetime: {
                        search: true
                    }
                })
            },
        },
    };
};
