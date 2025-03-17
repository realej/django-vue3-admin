import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Session } from '/@/utils/storage';
import qs from 'qs';

// Configure a new one axios Example
const service: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 50000,
	headers: { 'Content-Type': 'application/json' },
	paramsSerializer: {
		serialize(params) {
			return qs.stringify(params, { allowDots: true });
		},
	},
});

// Add a request interceptor
service.interceptors.request.use(
	(config: AxiosRequestConfig) => {
		// What to do before sending a request token
		if (Session.get('token')) {
			config.headers!['Authorization'] = `${Session.get('token')}`;
		}
		return config;
	},
	(error) => {
		// What to do with the request error
		return Promise.reject(error);
	}
);

// Add a response interceptor
service.interceptors.response.use(
	(response) => {
		// What to do with the response data
		const res = response.data;
		if (res.code && res.code !== 0) {
			// `token` Expired or the account has been logged in elsewhere
			if (res.code === 401 || res.code === 4001) {
				Session.clear(); // Clear all temporary caches from the browser
				window.location.href = '/'; // Go to the login page
				ElMessageBox.alert('You have been logged out，Please log in again', 'hint', {})
					.then(() => {})
					.catch(() => {});
			}
			return Promise.reject(service.interceptors.response);
		} else {
			return response.data;
		}
	},
	(error) => {
		// What to do to respond to errors
		if (error.message.indexOf('timeout') != -1) {
			ElMessage.error('Network timeout');
		} else if (error.message == 'Network Error') {
			ElMessage.error('Network connection error');
		} else {
			if (error.response.data) ElMessage.error(error.response.statusText);
			else ElMessage.error('The interface path cannot be found');
		}
		return Promise.reject(error);
	}
);

// Export axios Example
export default service;
