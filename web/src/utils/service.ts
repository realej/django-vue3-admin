import axios from 'axios';
import { get } from 'lodash-es';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Action } from 'element-plus';

// @ts-ignore
import { errorLog, errorCreate } from './tools.ts';
// import { env } from "/src/utils/util.env";
// import { useUserStore } from "../store/modules/user";
import { Local, Session } from '/@/utils/storage';
import qs from 'qs';
import { getBaseURL } from './baseUrl';
import { successMessage } from './message.js';
/**
 * @description Create a request instance
 */
function createService() {
	// Create a axios Example
	const service = axios.create({
		timeout: 20000,
		headers: {
			'Content-Type': 'application/json;charset=utf-8',
		},
		paramsSerializer: {
			serialize(params) {
				interface paramsObj {
					[key: string]: any;
				}
				let result: paramsObj = {};
				for (const [key, value] of Object.entries(params)) {
					if (value !== '') {
						result[key] = value;
					}
					if (typeof value === 'boolean') {
						result[key] = value ? 'True' : 'False';
					}
				}
				return qs.stringify(result);
			},
		},
	});
	// Request for interception
	service.interceptors.request.use(
		(config) => config,
		(error) => {
			// Send failed
			console.log(error);
			return Promise.reject(error);
		}
	);
	// Response to intercept
	service.interceptors.response.use(
		(response) => {
			if (response.config.responseType === 'blob') {
				return response;
			}
			// dataAxios yes axios Returns the data data
			const dataAxios = response.data;
			// This status code is agreed with the backend
			const { code } = dataAxios;
			// swaggerJudgment
			if (dataAxios.swagger != undefined) {
				return dataAxios;
			}
			// according to code Make a judgment
			if (code === undefined) {
				// If not code It means this is not the interface for the project backend development
				errorCreate(`Non-standard return：${dataAxios}， ${response.config.url}`, false);
				return dataAxios;
			} else {
				// have code This means this is a backend interface Further judgments can be made
				switch (code) {
					case 400:
						// Local.clear();
						// Session.clear();
						errorCreate(`${dataAxios.msg}: ${response.config.url}`);
						// window.location.reload();
						break;
					case 401:
						// Local.clear();
						Session.clear();
						dataAxios.msg = 'Login authentication failed，Please log in again';
						ElMessageBox.alert(dataAxios.msg, 'hint', {
							confirmButtonText: 'OK',
							callback: (action: Action) => {
								// window.location.reload();
							},
						});
						errorCreate(`${dataAxios.msg}: ${response.config.url}`);
						break;
					case 2000:
						// @ts-ignore
						if (response.config.unpack === false) {
							//If you don't need to unpack it
							return dataAxios;
						}
						return dataAxios;
					case 4000:
						errorCreate(`${dataAxios.msg}: ${response.config.url}`);
						break;
					default:
						// Not correct code
						errorCreate(`${dataAxios.msg}: ${response.config.url}`);
						break;
				}
				return Promise.reject(dataAxios);
			}
		},
		(error) => {
			const status = get(error, 'response.status');
			switch (status) {
				case 400:
					error.message = 'Request error';
					break;
				case 401:
					// Local.clear();
					Session.clear();
					error.message = 'Login authorization expires，Please log in again';
					ElMessageBox.alert(error.message, 'hint', {
						confirmButtonText: 'OK',
						callback: (action: Action) => {
							window.location.reload();
						},
					});
					break;
				case 403:
					error.message = 'access denied';
					break;
				case 404:
					error.message = `An error occurred in requesting address: ${error.response.config.url}`;
					break;
				case 408:
					error.message = 'Request timeout';
					break;
				case 500:
					error.message = 'Internal server error';
					break;
				case 501:
					error.message = 'Service not implemented';
					break;
				case 502:
					error.message = 'Gateway error';
					break;
				case 503:
					error.message = 'Service not available';
					break;
				case 504:
					error.message = 'Gateway timeout';
					break;
				case 505:
					error.message = 'HTTPVersion not supported';
					break;
				default:
					break;
			}
			errorLog(error);
			if (status === 401) {
				// const userStore = useUserStore();
				// userStore.logout();
			}
			return Promise.reject(error);
		}
	);
	return service;
}

/**
 * @description Create a request method
 * @param {Object} service axios Example
 */
function createRequestFunction(service: any) {
	return function (config: any) {
		const configDefault = {
			headers: {
				'Content-Type': get(config, 'headers.Content-Type', 'application/json'),
			},
			timeout: 5000,
			baseURL: getBaseURL(),
			data: {},
		};

		// const token = userStore.getToken;
		const token = Session.get('token');
		if (token != null) {
			// @ts-ignore
			configDefault.headers.Authorization = 'JWT ' + token;
		}
		return service(Object.assign(configDefault, config));
	};
}

// Instances and request methods for real network requests
export const service = createService();
export const request = createRequestFunction(service);

// Instances and request methods for simulating network requests
export const serviceForMock = createService();
export const requestForMock = createRequestFunction(serviceForMock);

/**
 * Download the file
 * @param url
 * @param params
 * @param method
 * @param filename
 */
export const downloadFile = function ({ url, params, method, filename = 'File Export' }: any) {
	// return request({ url: url, method: method, params: params })
	// 	.then((res: any) => successMessage(res.msg));
	request({
		url: url,
		method: method,
		params: params,
		responseType: 'blob'
		// headers: {Accept: 'application/vnd.openxmlformats-officedocument'}
	}).then((res: any) => {
		// console.log(res.headers['content-type']); // according tocontent-typeDifferent to determine whether to download asynchronously
		// if (res.headers && res.headers['Content-type'] === 'application/json') return successMessage('Import task has been created，Please go‘Download Center’Waiting for download');
		if (res.headers['content-type'] === 'application/json') return successMessage('Import task has been created，Please go‘Download Center’Waiting for download');
		const xlsxName = window.decodeURI(res.headers['content-disposition'].split('=')[1])
		const fileName = xlsxName || `${filename}.xlsx`
		if (res) {
			const blob = new Blob([res.data], { type: 'charset=utf-8' })
			const elink = document.createElement('a')
			elink.download = fileName
			elink.style.display = 'none'
			elink.href = URL.createObjectURL(blob)
			document.body.appendChild(elink)
			elink.click()
			URL.revokeObjectURL(elink.href) // releaseURL Object0
			document.body.removeChild(elink)
		}
	})
}
