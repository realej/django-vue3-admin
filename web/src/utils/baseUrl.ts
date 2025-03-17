import { pluginsAll } from '/@/views/plugins/index';

/**
 * @description Verify that it is tenant mode。Replace domain names with tenant mode domain name Add port
 */
export const getBaseURL = function (url: null | string = null, isHost: null | boolean = null) {
	let baseURL = import.meta.env.VITE_API_URL as any;
	// If neededhostreturn，hour，Return address prefix plushttpaddress
	if (isHost && !baseURL.startsWith('http')) {
		baseURL = window.location.protocol + '//' + window.location.host + baseURL
	}
	let param = baseURL.split('/')[3] || '';
	// @ts-ignore
	if (pluginsAll && pluginsAll.indexOf('dvadmin3-tenants-web') !== -1 && (!param || baseURL.startsWith('/'))) {
		// 1.Bundle127.0.0.1 Replace with the same domain name as the front end
		// 2.Bundle ip Replace the address with the same domain name as the front end
		// 3.Bundle /api Or other similar replacement with the same domain name as the front end
		// document.domain

		var host = baseURL.split('/')[2];
		if (host) {
			var port = baseURL.split(':')[2] || 80;
			if (port === 80 || port === 443) {
				host = document.domain;
			} else {
				host = document.domain + ':' + port;
			}
			baseURL = baseURL.split('/')[0] + '//' + baseURL.split('/')[1] + host + '/' + param;
		} else {
			baseURL = location.protocol + '//' + location.hostname + (location.port ? ':' : '') + location.port + baseURL;
		}
	}
	if (url) {
		const regex = /^(http|https):\/\//;
		if (regex.test(url)) {
			return url
		} else {
			// jsDetermine whether it is the end of a slash
			return baseURL.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
		}
	}
	if (!baseURL.endsWith('/')) {
		baseURL += '/';
	}
	return baseURL;
};

export const getWsBaseURL = function () {
	let baseURL = import.meta.env.VITE_API_URL as any;
	let param = baseURL.split('/')[3] || '';
	// @ts-ignore
	if (pluginsAll && pluginsAll.indexOf('dvadmin3-tenants-web') !== -1 && (!param || baseURL.startsWith('/'))) {
		// 1.Bundle127.0.0.1 Replace with the same domain name as the front end
		// 2.Bundle ip Replace the address with the same domain name as the front end
		// 3.Bundle /api Or other similar replacement with the same domain name as the front end
		// document.domain
		var host = baseURL.split('/')[2];
		if (host) {
			var port = baseURL.split(':')[2] || 80;
			if (port === 80 || port === 443) {
				host = document.domain;
			} else {
				host = document.domain + ':' + port;
			}
			baseURL = baseURL.split('/')[0] + '//' + baseURL.split('/')[1] + host + '/' + param;
		} else {
			baseURL = location.protocol + '//' + location.hostname + (location.port ? ':' : '') + location.port + baseURL;
		}
	} else if (param !== '' || baseURL.startsWith('/')) {
		baseURL = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.hostname + (location.port ? ':' : '') + location.port + baseURL;
	}
	if (!baseURL.endsWith('/')) {
		baseURL += '/';
	}
	if (baseURL.startsWith('http')) {
		// https It will also be replaced by wss
		baseURL = baseURL.replace('http', 'ws');
	}
	return baseURL;
};
