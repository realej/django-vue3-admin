import { defineStore } from 'pinia';
import { Session } from '/@/utils/storage';

/**
 * TagsView Routing list
 * @methods setTagsViewRoutes set up TagsView Routing list
 * @methods setCurrenFullscreen Settings on/When full screen is turned off boolean state
 */
export const useTagsViewRoutes = defineStore('tagsViewRoutes', {
	state: (): TagsViewRoutesState => ({
		tagsViewRoutes: [],
		isTagsViewCurrenFull: false,
	}),
	actions: {
		async setTagsViewRoutes(data: Array<string>) {
			this.tagsViewRoutes = data;
		},
		setCurrenFullscreen(bool: Boolean) {
			Session.set('isTagsViewCurrenFull', bool);
			this.isTagsViewCurrenFull = bool;
		},
	},
});
