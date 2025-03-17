import { request } from "/@/utils/service";

/**
 * Backend control menu simulationjson，The path is https://gitee.com/lyt-top/vue-next-admin-images/tree/master/menu
 * Backend control routing，isRequestRoutes for true，Turn on the backend control routing
 * @method getMenuAdmin Get backend dynamic routing menu(admin)
 * @method getMenuTest Get backend dynamic routing menu(test)
 */
export function useMenuApi() {
	return {
		getSystemMenu: (params?: object) => {
			return request({
				url: '/api/system/menu/web_router/',
				method: 'get',
				params,
			});
		},
		getMenuAdmin: (params?: object) => {
			return request({
				url: '/gitee/lyt-top/vue-next-admin-images/raw/master/menu/adminMenu.json',
				method: 'get',
				params,
			});
		},
		getMenuTest: (params?: object) => {
			return request({
				url: '/gitee/lyt-top/vue-next-admin-images/raw/master/menu/testMenu.json',
				method: 'get',
				params,
			});
		},
	};
}
