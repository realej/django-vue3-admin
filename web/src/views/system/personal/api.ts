import { request } from '/@/utils/service';
import { PageQuery, AddReq, DelReq, EditReq, InfoReq } from '@fast-crud/fast-crud';
import { apiPrefix } from '/@/views/system/messageCenter/api';
export function GetUserInfo(query: PageQuery) {
	return request({
		url: '/api/system/user/user_info/',
		method: 'get',
		params: query,
	});
}

/**
 * Update user information
 * @param data
 */
export function updateUserInfo(data: AddReq) {
	return request({
		url: '/api/system/user/update_user_info/',
		method: 'put',
		data: data,
	});
}

/**
 * Get the message you received
 * @param query
 * @returns {*}
 * @constructor
 */
export function GetSelfReceive(query: PageQuery) {
	return request({
		url: '/api/system/message_center/get_self_receive/',
		method: 'get',
		params: query,
	});
}

/***
 * Modify password
 * @param data
 */
export function UpdatePassword(data: EditReq) {
	return request({
		url: '/api/system/user/change_password/',
		method: 'put',
		data: data,
	});
}

/***
 * Upload avatar
 * @param data
 */
export function uploadAvatar(data: AddReq) {
	return request({
		url: 'api/system/file/',
		method: 'post',
		data: data,
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
}
