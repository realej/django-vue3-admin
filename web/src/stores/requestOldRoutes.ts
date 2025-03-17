import { defineStore } from 'pinia';

/**
 * Backend returns to the original route(When unprocessed)
 * @methods setCacheKeepAlive Set the interface raw routing data
 */
export const useRequestOldRoutes = defineStore('requestOldRoutes', {
	state: (): RequestOldRoutesState => ({
		requestOldRoutes: [],
	}),
	actions: {
		async setRequestOldRoutes(routes: Array<string>) {
			this.requestOldRoutes = routes;
		},
	},
});
