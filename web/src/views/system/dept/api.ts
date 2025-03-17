import { request } from '/@/utils/service';
import { UserPageQuery, AddReq, EditReq, InfoReq, PageQuery } from '@fast-crud/fast-crud';

export const apiPrefix = '/api/system/dept/';

export function GetList(query: UserPageQuery) {
	return request({
		url: apiPrefix,
		method: 'get',
		params: query,
	});
}

export function GetObj(id: InfoReq) {
	return request({
		url: apiPrefix + id,
		method: 'get',
	});
}

export function AddObj(obj: AddReq) {
	return request({
		url: apiPrefix,
		method: 'post',
		data: obj,
	});
}

export function UpdateObj(obj: EditReq) {
	return request({
		url: apiPrefix + obj.id + '/',
		method: 'put',
		data: obj,
	});
}

export function DelObj(id: string) {
	return request({
		url: apiPrefix + id + '/',
		method: 'delete'
	});
}

export function lazyLoadDept(query: UserPageQuery) {
	return request({
		url: apiPrefix,
		method: 'get',
		params: query,
	});
}

/**
 * Move up and down
 */
export function deptMoveUp(obj: AddReq) {
	return request({
		url: apiPrefix + 'move_up/',
		method: 'post',
		data: obj,
	});
}

export function deptMoveDown(obj: AddReq) {
	return request({
		url: apiPrefix + 'move_down/',
		method: 'post',
		data: obj,
	});
}

/**
 * User-related interface
 */
export function getDeptUserList(query: PageQuery) {
	return request({
		url: "/api/system/user/",
		method: 'get',
		params: query,
	});
}

/**
 * Get a list of all departments
 */
export function getAllDeptList() {
	return request({
		url: "/api/system/dept/all_dept/",
		method: 'get',
	});
}
