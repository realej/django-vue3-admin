import {createRouter, createWebHashHistory} from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import pinia from '/@/stores/index';
import {storeToRefs} from 'pinia';
import {useKeepALiveNames} from '/@/stores/keepAliveNames';
import {useRoutesList} from '/@/stores/routesList';
import {useThemeConfig} from '/@/stores/themeConfig';
import {Session} from '/@/utils/storage';
import {dynamicRoutes, notFoundAndNoPower, staticRoutes} from '/@/router/route';
import {initFrontEndControlRoutes} from '/@/router/frontEnd';
import {initBackEndControlRoutes, setRouters} from '/@/router/backEnd';
import {useFrontendMenuStore} from "/@/stores/frontendMenu";
import {useTagsViewRoutes} from "/@/stores/tagsViewRoutes";
import {toRaw} from "vue";
import {checkVersion} from "/@/utils/upgrade";

/**
 * 1、When front-end controls routing：isRequestRoutes for false，Need to write roles，Need to leave setFilterRoute method。
 * 2、When the backend controls routing：isRequestRoutes for true，No need to write roles，No need to leave setFilterRoute method），
 * The relevant methods have been disassembled to the corresponding `backEnd.ts` and `frontEnd.ts`（They don't affect each other，No need to change at the same time 2 A file）。
 * Special Note：
 * 1、Front-end control：The routing menu is written by the front end（No menu management interface，Have a role management interface），There are role management roles property，Need to return to userInfo middle。
 * 2、Backend control：The routing menu is returned by the backend（There is a menu management interface、Have a role management interface）
 */

// Read `/src/stores/themeConfig.ts` Whether to enable backend control routing configuration
const storesThemeConfig = useThemeConfig(pinia);
const {themeConfig} = storeToRefs(storesThemeConfig);
const {isRequestRoutes} = themeConfig.value;
import {useUserInfo} from "/@/stores/userInfo";
const { userInfos } = storeToRefs(useUserInfo());

/**
 * Create a Vue The routing example used by the application
 * @method createRouter(options: RouterOptions): Router
 * @link reference：https://next.router.vuejs.org/zh/api/#createrouter
 */
export const router = createRouter({
    history: createWebHashHistory(),
    /**
     * illustrate：
     * 1、notFoundAndNoPower Added by default 404、401 interface，Prevent prompts No match found for location with path 'xxx'
     * 2、backEnd.ts(Backend control routing)、frontEnd.ts(Front-end control routing) You also need to add notFoundAndNoPower 404、401 interface。
     *    prevent 404、401 Not here layout In layout，If not set，404、401 The interface will be displayed in full screen
     */
    routes: [...notFoundAndNoPower, ...staticRoutes]
});

/**
 * Routing multi-level nested arrays are processed into one-dimensional arrays
 * @param arr Incoming routing menu data array
 * @returns Returns the processed one-dimensional routing menu array
 */
export function formatFlatteningRoutes(arr: any) {
    if (arr.length <= 0) return false;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].children) {
            arr = arr.slice(0, i + 1).concat(arr[i].children, arr.slice(i + 1));
        }
    }
    return arr;
}

/**
 * Process one-dimensional array into multi-level nested arrays（Only the second level is retained：That is, all levels two or above are processed to only level two，keep-alive Supports Level 2 cache）
 * @description isKeepAlive deal with `name` value，Cache。Top Close，No cache
 * @link reference：https://v3.cn.vuejs.org/api/built-in-components.html#keep-alive
 * @param arr Processed one-dimensional routing menu array
 * @returns Return to reprocess the one-dimensional array into `Define dynamic routing（dynamicRoutes）` Format
 */
export function formatTwoStageRoutes(arr: any) {
    if (arr.length <= 0) return false;
    const newArr: any = [];
    const cacheList: Array<string> = [];
    arr.forEach((v: any) => {
        if (v.path === '/') {
            newArr.push({component: v.component,name: v.name,path: v.path,redirect: v.redirect,meta: v.meta,children: []});
        } else {
            // Determine whether it is a dynamic routing（xx/:id/:name），For tagsView Used in other places
            // repair：https://gitee.com/lyt-top/vue-next-admin/issues/I3YX6G
            if (v.path.indexOf('/:') > -1) {
                v.meta['isDynamic'] = true;
                v.meta['isDynamicPath'] = v.path;
            }
            newArr[0].children.push({...v});
            // live name value，keep-alive middle include use，Implement routing cache
            // path：/@/layout/routerView/parent.vue
            if (newArr[0].meta.isKeepAlive && v.meta.isKeepAlive && v.component_name != "") {
                cacheList.push(v.name);
                const stores = useKeepALiveNames(pinia);
                stores.setCacheKeepAlive(cacheList);
            }
        }
    });
    return newArr;
}

const frameOutRoutes = staticRoutes.map(item => item.path)

// Before the route loads
router.beforeEach(async (to, from, next) => {
    // Check whether the browser's local version is consistent with the online version，Determine whether the page needs to be refreshed for updates
    await checkVersion()
    NProgress.configure({showSpinner: false});
    if (to.meta.title) NProgress.start();
    const token = Session.get('token');
    if (to.path === '/login' && !token) {
        next();
        NProgress.done();
    } else {
        if (!token) {
            next(`/login?redirect=${to.path}&params=${JSON.stringify(to.query ? to.query : to.params)}`);
            Session.clear();
            NProgress.done();
        }else if (token && to.path === '/login' && userInfos.value.pwd_change_count===0 ) {
            next('/login');
            NProgress.done();
        } else if (token && to.path === '/login' && userInfos.value.pwd_change_count>0) {
            next('/home');
            NProgress.done();
        }else if(token &&  frameOutRoutes.includes(to.path) ){
            next()
        } else {
            const storesRoutesList = useRoutesList(pinia);
            const {routesList} = storeToRefs(storesRoutesList);
            if (routesList.value.length === 0) {
                if (isRequestRoutes) {
                    // Backend control routing：Routing data initialization，Prevent loss during refresh
                    await initBackEndControlRoutes();
                    // Resolve refresh time，Keep jumping 404 Page Problems，Related issues No match found for location with path 'xxx'
                    // to.query Prevent page refresh，When normal routes have parameters，Parameters are missing。Dynamic routing（xxx/:id/:name"）isDynamic No processing required

                    next({ path: to.path, query: to.query });
                } else {
                    // https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
                    await initFrontEndControlRoutes();
                    next({ path: to.path, query: to.query });
                }
            } else {
                next();
            }
        }
    }
});

// After the route is loaded
router.afterEach(() => {
    NProgress.done();
});

// Export the route
export default router;
