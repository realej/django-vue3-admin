import { request } from '/@/utils/service';
import XEUtils from 'xe-utils';
/**
 * Get Role-menu
 * @param query
 */
export function getRoleMenu(query: object) {
	return request({
		url: '/api/system/role_menu_button_permission/get_role_menu/',
		method: 'get',
		params: query,
	}).then((res: any) => {
		return XEUtils.toArrayTree(res.data, { key: 'id', parentKey: 'parent', children: 'children', strict: false });
	});
}
/**
 * set up Role-menu
 * @param data
 * @returns
 */
export function setRoleMenu(data: object) {
	return request({
		url: '/api/system/role_menu_button_permission/set_role_menu/',
		method: 'put',
		data,
	});
}
/**
 * Get Role-menu-Button-Column fields
 * @param query
 */
export function getRoleMenuBtnField(query: object) {
	return request({
		url: '/api/system/role_menu_button_permission/get_role_menu_btn_field/',
		method: 'get',
		params: query,
	});
}

/**
 * set up Role-menu-Button
 * @param data
 */
export function setRoleMenuBtn(data: object) {
	return request({
		url: '/api/system/role_menu_button_permission/set_role_menu_btn/',
		method: 'put',
		data,
	});
}

/**
 * set up Role-menu-Column fields
 * @param data
 */
export function setRoleMenuField(roleId: string | number | undefined, data: object) {
	return request({
		url: `/api/system/role_menu_button_permission/${roleId}/set_role_menu_field/`,
		method: 'put',
		data,
	});
}

/**
 * set up Role-menu-Button-Data permissions
 * @param query
 * @returns
 */
export function setRoleMenuBtnDataRange(data: object) {
	return request({
		url: '/api/system/role_menu_button_permission/set_role_menu_btn_data_range/',
		method: 'put',
		data,
	});
}

/**
 * Obtain the department that can be authorized under the current user role
 * @param query
 * @returns
 */
export function getRoleToDeptAll(query: object) {
	return request({
		url: '/api/system/role_menu_button_permission/role_to_dept_all/',
		method: 'get',
		params: query,
	});
}

/**
 * Get all users
 * @param query
 * @returns
 */
export function getAllUsers() {
	return request({
		url: '/api/system/user/',
		method: 'get',
		params: { limit: 999 },
	}).then((res: any) => {
		return XEUtils.map(res.data, (item: any) => {
			return {
				id: item.id,
				name: item.name,
			};
		});
	});
}

/**
 * Set up roles-user
 * @param query
 * @returns
 */
export function setRoleUsers(roleId: string | number | undefined, data: object) {
	return request({
		url: `/api/system/role/${roleId}/set_role_users/`,
		method: 'put',
		data,
	});
}
