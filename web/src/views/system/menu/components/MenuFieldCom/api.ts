import { request } from '/@/utils/service';
import { UserPageQuery, AddReq, DelReq, EditReq, InfoReq } from '@fast-crud/fast-crud';
import XEUtils from "xe-utils";
import {CurrentInfoType} from "/@/views/system/columns/types";

export const apiPrefix = '/api/system/column/';
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

export function DelObj(id: DelReq) {
	return request({
		url: apiPrefix + id + '/',
		method: 'delete',
		data: { id },
	});
}

export function BatchDelete(keys: any) {
	return request({
		url: apiPrefix + 'multiple_delete/',
		method: 'delete',
		data: { keys },
	});
}
/**
 * Get allmodel
 */
export function getModelList() {
	return request({
		url: '/api/system/column/get_models/',
		method: 'get',
	});
}

/**
 * Automatic matchingfield
 * @param data
 */
export function automatchColumnsData(data: CurrentInfoType) {
	return request({
		url: '/api/system/column/auto_match_fields/',
		method: 'post',
		data,
	});
}
