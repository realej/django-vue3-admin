import { RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import { formatTwoStageRoutes, formatFlatteningRoutes, router } from '/@/router/index';
import { dynamicRoutes, notFoundAndNoPower } from '/@/router/route';
import pinia from '/@/stores/index';
import { Session } from '/@/utils/storage';
import { useUserInfo } from '/@/stores/userInfo';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useRoutesList } from '/@/stores/routesList';
import { NextLoading } from '/@/utils/loading';

// Front-end control routing

/**
 * Front-end control routing：Initialization method，Prevent route loss during refresh
 * @method  NextLoading interface loading The animation starts executing
 * @method useUserInfo(pinia).setUserInfos() Trigger initialization of user information pinia
 * @method setAddRoute Add dynamic routing
 * @method setFilterMenuAndCacheTagsViewRoutes Set recursive filtering of permissioned routes pinia routesList middle（Processed into multi-level nested routing）and cache one-dimensional arrays processed by multi-level nested arrays
 */
export async function initFrontEndControlRoutes() {
	// interface loading The animation starts executing
	if (window.nextLoading === undefined) NextLoading.start();
	// none token Stop executing the next step
	if (!Session.get('token')) return false;
	// Trigger initialization of user information pinia
	// https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
	await useUserInfo(pinia).setUserInfos();
	// When there is no login permission，Add judgment
	// https://gitee.com/lyt-top/vue-next-admin/issues/I64HVO
	if (useUserInfo().userInfos.roles.length <= 0) return Promise.resolve(true);
	// Add dynamic routing
	await setAddRoute();
	// Set recursive filtering of permissioned routes pinia routesList middle（Processed into multi-level nested routing）and cache one-dimensional arrays processed by multi-level nested arrays
	await setFilterMenuAndCacheTagsViewRoutes();
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
 * delete/Reset the routing
 * @method router.removeRoute
 * @description Here the cycle is dynamicRoutes（/@/router/route）The first top level children One-dimensional array of routes，Non-multi-level nesting
 * @link reference：https://next.router.vuejs.org/zh/api/#push
 */
export async function frontEndsResetRoute() {
	await setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
		const routeName: any = route.name;
		router.hasRoute(routeName) && router.removeRoute(routeName);
	});
}

/**
 * Get the route array with the current user permission identification，Replace the original route
 * @description replace dynamicRoutes（/@/router/route）The first top level children Routing
 * @returns Returns the replaced route array
 */
export function setFilterRouteEnd() {
	let filterRouteEnd: any = formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes));
	// notFoundAndNoPower prevent 404、401 Not here layout In layout，If not set，404、401 The interface will be displayed in full screen
	// Related issues No match found for location with path 'xxx'
	filterRouteEnd[0].children = [...setFilterRoute(filterRouteEnd[0].children), ...notFoundAndNoPower];
	return filterRouteEnd;
}

/**
 * Get the current user permission ID to compare the routing table（Not processed into multi-level nested routes）
 * @description This is mainly used for dynamic routing addition，router.addRoute
 * @link reference：https://next.router.vuejs.org/zh/api/#addroute
 * @param chil dynamicRoutes（/@/router/route）The first top level children The lower routing collection
 * @returns Returns the route array with the current user permission identification
 */
export function setFilterRoute(chil: any) {
	const stores = useUserInfo(pinia);
	const { userInfos } = storeToRefs(stores);
	let filterRoute: any = [];
	chil.forEach((route: any) => {
		if (route.meta.roles) {
			route.meta.roles.forEach((metaRoles: any) => {
				userInfos.value.roles.forEach((roles: any) => {
					if (metaRoles === roles) filterRoute.push({ ...route });
				});
			});
		}
	});
	return filterRoute;
}

/**
 * Caches one-dimensional arrays processed by multi-level nested arrays
 * @description For tagsView、Menu search：Unfiltered hidden(isHide)
 */
export function setCacheTagsViewRoutes() {
	// Get permissioned routes，otherwise tagsView、Routes without permissions in menu search will also be displayed
	const stores = useUserInfo(pinia);
	const storesTagsView = useTagsViewRoutes(pinia);
	const { userInfos } = storeToRefs(stores);
	let rolesRoutes = setFilterHasRolesMenu(dynamicRoutes, userInfos.value.roles);
	// Add to pinia setTagsViewRoutes middle
	storesTagsView.setTagsViewRoutes(formatTwoStageRoutes(formatFlatteningRoutes(rolesRoutes))[0].children);
}

/**
 * Set recursive filtering of permissioned routes pinia routesList middle（Processed into multi-level nested routing）and cache one-dimensional arrays processed by multi-level nested arrays
 * @description For left-hand menu、Display of horizontal menu
 * @description For tagsView、Menu search：Unfiltered hidden(isHide)
 */
export function setFilterMenuAndCacheTagsViewRoutes() {
	const stores = useUserInfo(pinia);
	const storesRoutesList = useRoutesList(pinia);
	const { userInfos } = storeToRefs(stores);
	storesRoutesList.setRoutesList(setFilterHasRolesMenu(dynamicRoutes[0].children, userInfos.value.roles));
	setCacheTagsViewRoutes();
}

/**
 * Judge routing `meta.roles` Whether the current login user permission field is included
 * @param roles User permission identification，exist userInfos（User Information）of roles（Login page cached to the browser when logging in）Error 500 (Server Error)!!1500.That’s an error.There was an error. Please try again later.That’s all we know.
 * @param route Error 500 (Server Error)!!1500.That’s an error.There was an error. Please try again later.That’s all we know.
 * @returns Error 500 (Server Error)!!1500.That’s an error.There was an error. Please try again later.That’s all we know.
 */
export function hasRoles(roles: any, route: any) {
	if (route.meta && route.meta.roles) return roles.some((role: any) => route.meta.roles.includes(role));
	else return true;
}

/**
 * Get the current user permission ID to compare the routing table，Set recursive filtering of permissioned routes
 * @param routes Current routing children
 * @param roles User permission identification，exist userInfos（User Information）of roles（Login page cached to the browser when logging in）Array
 * @returns Returns a privileged route array `meta.roles` Central control
 */
export function setFilterHasRolesMenu(routes: any, roles: any) {
	const menu: any = [];
	routes.forEach((route: any) => {
		const item = { ...route };
		if (hasRoles(roles, item)) {
			if (item.children) item.children = setFilterHasRolesMenu(item.children, roles);
			menu.push(item);
		}
	});
	return menu;
}
