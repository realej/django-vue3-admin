// Introducedfast-crud
import {FastCrud, useTypes} from '@fast-crud/fast-crud';

const {getType} = useTypes();
import '@fast-crud/fast-crud/dist/style.css';
import {setLogger} from '@fast-crud/fast-crud';
import {getBaseURL} from '/@/utils/baseUrl';
// element
import ui from '@fast-crud/ui-element';
import {request} from '/@/utils/service';
//Expansion Package
import {FsExtendsEditor, FsExtendsUploader } from '@fast-crud/fast-extends';
import '@fast-crud/fast-extends/dist/style.css';
import {successNotification} from '/@/utils/message';
import XEUtils from "xe-utils";
export default {
    async install(app: any, options: any) {
        // Install firstui
        app.use(ui);
        // Then installFastCrud
        app.use(FastCrud, {
            //i18n, //i18nConfiguration，Optional，Use Chinese by default，Please see the specific usagedemoInside src/i18n/index.js document
            // This is a public configurationdictRequest（Dictionary request）
            async dictRequest({dict,url}: any) {
                const {isTree} = dict
                //according todictofurl，Return a dictionary array asynchronously
                return await request({url: url, params: dict.params || {}}).then((res: any) => {
                    if (isTree) {
                        return XEUtils.toArrayTree(res.data, {parentKey: 'parent'})
                    }
                    return res.data
                });
            },
            //publiccrudConfiguration
            commonOptions() {
                return {
                    request: {
                        //Interface request configuration
                        //Your project's backend interface is likely to befast-crudThe required return structure is inconsistent，So you need to configure this
                        //Please refer to the documenthttp://fast-crud.docmirror.cn/api/crud-options/request.html
                        transformQuery: ({page, form, sort}: any) => {
                            if (sort.asc !== undefined) {
                                form['ordering'] = `${sort.asc ? '' : '-'}${sort.prop}`;
                            }
                            //Convert to youpageRequestRequired request parameter structure
                            return {page: page.currentPage, limit: page.pageSize, ...form};
                        },
                        transformRes: ({res}: any) => {
                            //WillpageRequestReturn data，Convert tofast-crudRequired format
                            //return {records,currentPage,pageSize,total};
                            return {records: res.data, currentPage: res.page, pageSize: res.limit, total: res.total};
                        },
                    },
                    form: {
                        afterSubmit(ctx: any) {
                            // Increasecrudhint
                            if (ctx.res.code == 2000) {
                                successNotification(ctx.res.msg);
                            }
                        },
                    },
                    /* search: {
                        layout: 'multi-line',
                        collapse: true,
                        col: {
                            span: 4,
                        },
                        options: {
                            labelCol: {
                                style: {
                                    width: '100px',
                                },
                            },
                        },
                    }, */
                };
            },
            logger: { off: { tableColumns: false } }
        });
        //Rich text
        app.use(FsExtendsEditor, {
            wangEditor: {
                width: 300,
            },
        });
        // File upload
        app.use(FsExtendsUploader, {
            defaultType: "form",
            form: {
                action: `/api/system/file/`,
                name: "file",
                withCredentials: false,
                uploadRequest: async ({ action, file, onProgress }: { action: string; file: any; onProgress: Function }) => {
                    // @ts-ignore
                    const data = new FormData();
                    data.append("file", file);
                    return await request({
                        url: action,
                        method: "post",
                        timeout: 60000,
                        headers: {
                            "Content-Type": "multipart/form-data"
                        },
                        data,
                        onUploadProgress: (p: any) => {
                            onProgress({percent: Math.round((p.loaded / p.total) * 100)});
                        }
                    });
                },
                successHandle(ret: any) {
                    // Processing of results after uploading， Here the format should be returned as{url:xxx,key:xxx}
                    return {
                        url: getBaseURL(ret.data.url),
                        key: ret.data.id,
                        ...ret.data
                    };
                }
            },
                valueBuilder(context: any){
                    const { row, key } = context
                    return getBaseURL(row[key])
                }
        })

        setLogger({level: 'error'});
        // Set up automatic staining
        const dictComponentList = ['dict-cascader', 'dict-checkbox', 'dict-radio', 'dict-select', 'dict-switch', 'dict-tree'];
        dictComponentList.forEach((val) => {
            getType(val).column.component.color = 'auto';
            getType(val).column.align = 'center';
        });
        // set upplaceholder Default value
        const placeholderComponentList = [
            {key: 'text', placeholder: "Please enter"},
            {key: 'textarea', placeholder: "Please enter"},
            {key: 'input', placeholder: "Please enter"},
            {key: 'password', placeholder: "Please enter"}
        ]
        placeholderComponentList.forEach((val) => {
            if (getType(val.key)?.search?.component) {
                getType(val.key).search.component.placeholder = val.placeholder;
            } else if (getType(val.key)?.search) {
                getType(val.key).search.component = {placeholder: val.placeholder};
            }
            if (getType(val.key)?.form?.component) {
                getType(val.key).form.component.placeholder = val.placeholder;
            } else if (getType(val.key)?.form) {
                getType(val.key).form.component = {placeholder: val.placeholder};
            }
            if (getType(val.key)?.column?.align) {
                getType(val.key).column.align = 'center'
            } else if (getType(val.key)?.column) {
                getType(val.key).column = {align: 'center'};
            } else if (getType(val.key)) {
                getType(val.key).column = {align: 'center'};
            }
        });
    },
};
