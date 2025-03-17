import {defineStore} from 'pinia';
import {FrontendMenu} from './interface';
import {Session} from '/@/utils/storage';
import {request} from '../utils/service';
import XEUtils from "xe-utils";
import {RouteRecordRaw} from "vue-router";
import {useKeepALiveNames} from "/@/stores/keepAliveNames";
import pinia from "/@/stores/index";


const layouModules: any = import.meta.glob('../layout/routerView/*.{vue,tsx}');
const viewsModules: any = import.meta.glob('../views/**/*.{vue,tsx}');


/**
 * Get the directory .vue、.tsx All files
 * @method import.meta.glob
 * @link reference：https://cn.vitejs.dev/guide/features.html#json
 */
const dynamicViewsModules: Record<string, Function> = Object.assign({}, { ...layouModules }, { ...viewsModules });

/**
 * Backend routing component Conversion function
 * @param dynamicViewsModules Get the directory .vue、.tsx All files
 * @param component Items to be processed currently component
 * @returns Returns the processed function component
 */
export function dynamicImport(dynamicViewsModules: Record<string, Function>, component: string) {
    const keys = Object.keys(dynamicViewsModules);
    const matchKeys = keys.filter((key) => {
        const k = key.replace(/..\/views|../, '');
        return k.startsWith(`${component}`) || k.startsWith(`/${component}`);
    });
    if (matchKeys?.length === 1) {
        const matchKey = matchKeys[0];
        return dynamicViewsModules[matchKey];
    }
    if (matchKeys?.length > 1) {
        return false;
    }
}

/**
 * @description: Process backend menu data format
 * @param {Array} menuData
 * @return {*}
 */
export const handleMenu = (menuData: Array<any>) => {
    // In-frame routing
    const frameInRoutes:Array<any> = []
    // Out-of-frame routing
    const frameOutRoutes:Array<any> = []
    // Routers that need cache
    const cacheList:Array<any> = []
    // Process it firstmenu metaData conversion
    const handleMeta = (item: any) => {
        item.path = item.web_path
        item.meta = {
            title: item.title,
            isLink: item.link_url,
            isHide: !item.visible,
            isKeepAlive: item.cache,
            isAffix: item.is_affix,
            isIframe: item.is_iframe,
            roles: ['admin'],
            icon: item.icon
        }
        item.component =  dynamicImport(dynamicViewsModules, item.component as string)
        if(item.is_catalog){
            // Processing of directories
            item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/parent')
        }
        if(item.is_link){
            // Processing of external links
            item.meta.isIframe = !item.is_iframe
            if(item.is_iframe){
                item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/link')
            }else {
                item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/iframes')
            }
        }else{
            if(item.is_iframe){
                const route = JSON.parse(JSON.stringify(item))
                route.meta.isLink = ''
                route.path = `${item.web_path}`
                route.name =  `${item.name}`
                route.meta.isIframe = true
                route.meta.isKeepAlive = false
                route.meta.isIframeOpen = true
                route.component = item.component
                frameOutRoutes.push(route)
                item.path = `${item.web_path}FrameOut`
                item.name =  `${item.name}FrameOut`
                item.meta.isLink = item.web_path
                item.meta.isIframe = !item.is_iframe
                //item.meta.isIframeOpen = true
                item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/link.vue')
            }
        }
        item.children && handleMeta(item.children);
        if (item.meta.isKeepAlive && item.meta.isKeepAlive && item.component_name != "") {
            cacheList.push(item.name);
        }
        return item
    }
    menuData.forEach((val) => {
        frameInRoutes.push(handleMeta(val))
    })
    const stores = useKeepALiveNames(pinia);
    stores.setCacheKeepAlive(cacheList);
    const data = XEUtils.toArrayTree(frameInRoutes, {
        parentKey: 'parent',
        strict: true,
    })
    const dynamicRoutes = [
        {
            path: '/home', name: 'home',
            component: dynamicImport(dynamicViewsModules, '/system/home/index'),
            meta: {
                title: 'message.router.home',
                isLink: '',
                isHide: false,
                isKeepAlive: true,
                isAffix: true,
                isIframe: false,
                roles: ['admin'],
                icon: 'iconfont icon-shouye'
            }
        },
        ...data
    ]
    return {frameIn:dynamicRoutes,frameOut:frameOutRoutes}
}

export const useFrontendMenuStore = defineStore('frontendMenu',{
    state: (): FrontendMenu => ({
        arrayRouter: [],
        treeRouter: [],
        frameInRoutes:[],
        frameOutRoutes:[]
    }),
    actions:{
        async requestMenu(){
           return  request({
                url: '/api/system/menu/web_router/',
                method: 'get',
                params:{},
            }).then((res:any)=>{
                return res.data
           });
        },
        async handleRouter(){
            const menuData = await this.requestMenu();
            this.arrayRouter = menuData
            const {frameIn,frameOut} = handleMenu(menuData);
            this.treeRouter = [...frameIn,...frameOut]
            this.frameInRoutes=frameIn
            this.frameOutRoutes=frameOut
        },
        async getRouter(){
            await this.handleRouter()
            return {
                frameInRoutes:this.frameInRoutes,
                frameOutRoutes:this.frameOutRoutes,
                treeRouter:this.treeRouter
            }
        }
    }
})
