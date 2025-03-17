import { RouteRecordRaw } from 'vue-router';

/**
 * routingmetaObject parameter description
 * meta: {
 *      title:          Menu bar and tagsView column、Menu Search Name（Internationalization）
 *      isLink：        Whether to hyperlink menu，Turn on external link conditions，`1、isLink: The link address is not empty`
 *      isHide：        Whether to hide this route
 *      isKeepAlive：   Whether to cache component status
 *      isAffix：       Is it fixed? tagsView On the column
 *      isIframe：      Is it embedded in the window，Open conditions，`1、isIframe:true 2、isLink：The link address is not empty`
 *      roles：         Current routing permission identification，Role management。Control routing display、hide。Super Administrator：admin Ordinary role：common
 *      icon：          menu、tagsView icon，Ali：add `iconfont xxx`，fontawesome：add `fa xxx`
 * }
 */

/**
 * Define dynamic routing
 * Add routes to the front end，Please in the top-level node `children Array` Added in
 * @description Not enabled isRequestRoutes for true When using（Front-end control routing），The first top level when turned on children The route will be replaced with the route data requested by the interface
 * @description Please check each field `/@/views/system/menu/component/addMenu.vue Next ruleForm`
 * @returns Return to routing menu data
 */
export const dynamicRoutes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: '/',
		component: () => import('/@/layout/index.vue'),
		redirect: '/home',
		meta: {
			isKeepAlive: true,
		},
		children: [],
	},
	{
		path: '/personal',
		name: 'personal',
		component: () => import('/@/views/system/personal/index.vue'),
		meta: {
			title: 'message.router.personal',
			isLink: '',
			isHide: false,
			isKeepAlive: true,
			isAffix: false,
			isIframe: false,
			icon: 'iconfont icon-gerenzhongxin',
		},
	}
];

/**
 * definition404、401interface
 * @link reference：https://next.router.vuejs.org/zh/guide/essentials/history-mode.html#netlify
 */
export const notFoundAndNoPower = [
	{
		path: '/:path(.*)*',
		name: 'notFound',
		component: () => import('/@/views/system/error/404.vue'),
		meta: {
			title: 'message.staticRoutes.notFound',
			isHide: true,
		},
	},
	{
		path: '/401',
		name: 'noPower',
		component: () => import('/@/views/system/error/401.vue'),
		meta: {
			title: 'message.staticRoutes.noPower',
			isHide: true,
		},
	},
];

/**
 * Define static routes（Default routing）
 * Don't move this route，If you add routes to the front end，Please `dynamicRoutes Array` Added in
 * @description Direct modification of front-end control dynamicRoutes Routing in，No modification is required for backend control，When requesting interface routing data，Will cover dynamicRoutes The first top level children Contents（full screen，Not included layout Routing exit in）
 * @returns Return to routing menu data
 */
export const staticRoutes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: 'login',
		component: () => import('/@/views/system/login/index.vue'),
		meta: {
			title: 'Log in',
		},
	},
	{
		path: '/demo',
		name: 'demo',
		component: () => import('/@/views/system/demo/index.vue'),
		meta: {
			title: 'message.router.personal'
		},
	}
];
