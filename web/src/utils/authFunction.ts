import { judementSameArr } from '/@/utils/arrayOperation';
import {BtnPermissionStore} from "/@/stores/btnPermission";
/**
 * Single permission verification
 * @param value Permission value
 * @returns Have permissions，return `true`，Otherwise, it is reversed
 */
export function auth(value: string): boolean {
	const stores = BtnPermissionStore();
	return stores.data.some((v: string) => v === value);
}

/**
 * Multiple permission verification，Satisfies one is true
 * @param value Permission value
 * @returns Have permissions，return `true`，Otherwise, it is reversed
 */
export function auths(value: Array<string>): boolean {
	let flag = false;
	const stores = BtnPermissionStore();
	stores.data.map((val: string) => {
		value.map((v: string) => {
			if (val === v) flag = true;
		});
	});
	return flag;
}

/**
 * Multiple permission verification，All satisfied are true
 * @param value Permission value
 * @returns Have permissions，return `true`，Otherwise, it is reversed
 */
export function authAll(value: Array<string>): boolean {
	const stores = BtnPermissionStore();
	return judementSameArr(value, stores.data);
}
