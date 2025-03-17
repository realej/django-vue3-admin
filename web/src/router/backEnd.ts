import { RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import pinia from '/@/stores/index';
import { useUserInfo } from '/@/stores/userInfo';
import { useRequestOldRoutes } from '/@/stores/requestOldRoutes';
import { Session } from '/@/utils/storage';
import { NextLoading } from '/@/utils/loading';
import { dynamicRoutes, notFoundAndNoPower } from '/@/router/route';
import { formatTwoStageRoutes, formatFlatteningRoutes, router } from '/@/router/index';
import { useRoutesList } from '/@/stores/routesList';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useMenuApi } from '/@/api/menu/index';
import { handleMenu } from '../utils/menu';
import { BtnPermissionStore } from '/@/plugin/permission/store.permission';
import {SystemConfigStore} from "/@/stores/systemConfig";
import {useDeptInfoStore} from "/@/stores/modules/dept";
import {DictionaryStore} from "/@/stores/dictionary";
import {useFrontendMenuStore} from "/@/stores/frontendMenu";
import {toRaw} from "vue";
const menuApi = useMenuApi();

const layouModules: any = import.meta.glob('../layout/routerView/*.{vue,tsx}');
const viewsModules: any = import.meta.glob('../views/**/*.{vue,tsx}');

/**
 * Get the directory .vue、.tsx All files
 * @method import.meta.glob
 * @link reference：https://cn.vitejs.dev/guide/features.html#json
 */
const dynamicViewsModules: Record<string, Function> = Object.assign({}, { ...layouModules }, { ...viewsModules });

/**
 * Backend control routing：Initialization method，Prevent route loss during refresh
 * @method NextLoading interface loading The animation starts executing
 * @method useUserInfo().setUserInfos() Trigger initialization of user information pinia
 * @method useRequestOldRoutes().setRequestOldRoutes() Storage interface original routing（Not processedcomponent），Choose to use according to your needs
 * @method setAddRoute Add dynamic routing
 * @method setFilterMenuAndCacheTagsViewRoutes Set up routing to vuex routesList middle（Processed into multi-level nested routing）and cache one-dimensional arrays processed by multi-level nested arrays
 */
export async function initBackEndControlRoutes() {
	// interface loading The animation starts executing
	if (window.nextLoading === undefined) NextLoading.start();
	// none token Stop executing the next step
	if (!Session.get('token')) return false;
	// Trigger initialization of user information pinia
	// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
	await useUserInfo().getApiUserInfo();
	// Get routing menu data
	const res = await getBackEndControlRoutes();
	// When there is no login permission，Add judgment
	// https://gitee.com/lyt-top/vue-next-admin/issues/I64HVO
	// if (res.data.length <= 0) return Promise.resolve(true);
	// Processing routing（component），replace dynamicRoutes（/@/router/route）The first top level children Routing
	const {frameIn,frameOut} = handleMenu(res.data)
	dynamicRoutes[0].children = await backEndComponent(frameIn);
	// Add dynamic routing
	await setAddRoute();
	// Set up routing to vuex routesList middle（Processed into multi-level nested routing）and cache one-dimensional arrays processed by multi-level nested arrays
	await setFilterMenuAndCacheTagsViewRoutes();
}

export async function setRouters(){
	const {frameInRoutes,frameOutRoutes} = await useFrontendMenuStore().getRouter()
	const frameInRouter = toRaw(frameInRoutes)
	const frameOutRouter = toRaw(frameOutRoutes)
	dynamicRoutes[0].children = frameInRouter
	dynamicRoutes.forEach((item:any)=>{
		router.addRoute(item)
	})
	frameOutRouter.forEach((item:any)=>{
		router.addRoute(item)
	})
	const storesRoutesList = useRoutesList(pinia);
	storesRoutesList.setRoutesList([...dynamicRoutes[0].children,...frameOutRouter]);
	const storesTagsView = useTagsViewRoutes(pinia);
	storesTagsView.setTagsViewRoutes([...dynamicRoutes[0].children,...frameOutRouter])

}

/**
 * Set up routing to vuex routesList middle（Processed into multi-level nested routing）and cache one-dimensional arrays processed by multi-level nested arrays
 * @description For left-hand menu、Display of horizontal menu
 * @description For tagsView、Menu search：Unfiltered hidden(isHide)
 */
export function setFilterMenuAndCacheTagsViewRoutes() {
	const storesRoutesList = useRoutesList(pinia);
	storesRoutesList.setRoutesList(dynamicRoutes[0].children as any);
	setCacheTagsViewRoutes();
}

/**
 * Caches one-dimensional arrays processed by multi-level nested arrays
 * @description For tagsView、Menu search：Unfiltered hidden(isHide)
 */
export function setCacheTagsViewRoutes() {
	const storesTagsView = useTagsViewRoutes(pinia);
	storesTagsView.setTagsViewRoutes(formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes))[0].children);
}

/**
 * Process routing formats and add capture of all routes or 404 Not found routing
 * @description replace dynamicRoutes（/@/router/route）The first top level children Routing
 * @returns Returns the replaced route array
 */
export function setFilterRouteEnd() {
	let filterRouteEnd: any = formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes));
	// notFoundAndNoPower prevent 404、401 Not here layout In layout，If not set，404、401 The interface will be displayed in full screen
	// Related issues No match found for location with path 'xxx'
	filterRouteEnd[0].children = [...filterRouteEnd[0].children, ...notFoundAndNoPower];
	return filterRouteEnd;
}

/**
 * Add dynamic routing
 * @method router.addRoute
 * @description Here the cycle is dynamicRoutes（/@/router/route）The first top level children One-dimensional array of routes，Non-multi-level nesting
 * @link reference：https://next.router.vuejs.org/zh/api/#addroute
 */
export async function setAddRoute() {
	await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
		router.addRoute(route);
	});
}

/**
 * Request the backend routing menu interface
 * @description isRequestRoutes for true，Turn on the backend control routing
 * @returns Return backend routing menu data
 */
export function getBackEndControlRoutes() {
	//Get all button permissions
	BtnPermissionStore().getBtnPermissionStore();
	// Get system configuration
	SystemConfigStore().getSystemConfigs()
	// Get all department information
	useDeptInfoStore().requestDeptInfo()
	// Get dictionary information
	DictionaryStore().getSystemDictionarys()
	return menuApi.getSystemMenu();
}

/**
 * Request the backend routing menu interface
 * @description Used to refresh menus using menu management interface（No tests were performed）
 * @description path：/src/views/system/menu/component/addMenu.vue
 */
export function setBackEndControlRefreshRoutes() {
	getBackEndControlRoutes();
}

/**
 * Backend routing component Convert
 * @param routes Array of routing tables returned by the backend
 * @returns Returns the processed function component
 */
export function backEndComponent(routes: any) {
	if (!routes) return;
	return routes.map((item: any) => {
		if (item.component) item.component = dynamicImport(dynamicViewsModules, item.component as string);
		if(item.is_catalog){
			// Processing of directories
			item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/parent')
		}
		if(item.is_link){
			// Processing of external links
			if(item.is_iframe){
				item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/iframes')
			}else {
				item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/link')
			}
		}else{
			if(item.is_iframe){
				// const iframeRoute:RouteRecordRaw = {
				// 	...item
				// }
				// router.addRoute(iframeRoute)
				item.meta.isLink = item.link_url
				// item.path = `${item.path}Link`
				// item.name = `${item.name}Link`
				// item.meta.isIframe = item.is_iframe
				// item.meta.isKeepAlive = false
				// item.meta.isIframeOpen = true
				item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/link.vue')
			}
		}
		item.children && backEndComponent(item.children);
		return item;
	});
}

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
