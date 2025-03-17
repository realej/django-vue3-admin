import Cookies from 'js-cookie';

/**
 * window.localStorage Browser permanent cache
 * @method set Setting up permanent cache
 * @method get Get permanent cache
 * @method remove Remove permanent cache
 * @method clear Remove all permanent caches
 */
export const Local = {
	// Setting up permanent cache
	set(key: string, val: any) {
		window.localStorage.setItem(key, JSON.stringify(val));
	},
	// Get permanent cache
	get(key: string) {
		let json = <string>window.localStorage.getItem(key);
		return JSON.parse(json);
	},
	// Remove permanent cache
	remove(key: string) {
		window.localStorage.removeItem(key);
	},
	// Remove all permanent caches
	clear() {
		window.localStorage.clear();
	},
};

/**
 * window.sessionStorage Temporary browser cache
 * @method set Setting up temporary cache
 * @method get Get temporary cache
 * @method remove Remove temporary cache
 * @method clear Remove all temporary caches
 */
export const Session = {
	// Setting up temporary cache
	set(key: string, val: any) {
		if (key === 'token') return Cookies.set(key, val);
		window.sessionStorage.setItem(key, JSON.stringify(val));
	},
	// Get temporary cache
	get(key: string) {
		if (key === 'token') return Cookies.get(key);
		let json = <string>window.sessionStorage.getItem(key);
		return JSON.parse(json);
	},
	// Remove temporary cache
	remove(key: string) {
		if (key === 'token') return Cookies.remove(key);
		window.sessionStorage.removeItem(key);
	},
	// Remove all temporary caches
	clear() {
		Cookies.remove('token');
		window.sessionStorage.clear();
	},
};
