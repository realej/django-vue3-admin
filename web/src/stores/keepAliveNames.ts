import { defineStore } from 'pinia';

/**
 * Routing cache list
 * @methods setCacheKeepAlive Set the route to cache names（Open Tagsview）
 * @methods addCachedView Add the route to cache names（closure Tagsview）
 * @methods delCachedView Delete the route to be cached names（closure Tagsview）
 * @methods delOthersCachedViews Right-click menu`Close Others`，Delete the route to be cached names（closure Tagsview）
 * @methods delAllCachedViews Right-click menu`Close all`，Delete the route to be cached names（closure Tagsview）
 */
export const useKeepALiveNames = defineStore('keepALiveNames', {
	state: (): KeepAliveNamesState => ({
		keepAliveNames: [],
		cachedViews: [],
	}),
	actions: {
		async setCacheKeepAlive(data: Array<string>) {
			this.keepAliveNames = data;
		},
		async addCachedView(view: any) {
			if (view.meta.isKeepAlive) this.cachedViews?.push(view.name);
		},
		async delCachedView(view: any) {
			const index = this.cachedViews.indexOf(view.name);
			index > -1 && this.cachedViews.splice(index, 1);
		},
		async delOthersCachedViews(view: any) {
			if (view.meta.isKeepAlive) this.cachedViews = [view.name];
			else this.cachedViews = [];
		},
		async delAllCachedViews() {
			this.cachedViews = [];
		},
	},
});
