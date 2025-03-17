import { defineStore } from 'pinia';

/**
 * Routing list
 * @methods setRoutesList Set up routing data
 * @methods setColumnsMenuHover Setting up column layout menu mouse move in boolean
 * @methods setColumnsNavHover Set the column layout and move the mouse to the leftmost navigation mouse boolean
 */
export const useRoutesList = defineStore('routesList', {
	state: (): RoutesListState => ({
		routesList: [],
		isColumnsMenuHover: false,
		isColumnsNavHover: false,
	}),
	actions: {
		async setRoutesList(data: Array<string>) {
			this.routesList = data;
		},
		async setColumnsMenuHover(bool: Boolean) {
			this.isColumnsMenuHover = bool;
		},
		async setColumnsNavHover(bool: Boolean) {
			this.isColumnsNavHover = bool;
		},
		async addRoutesList(data: Array<string>) {
			this.routesList.push(data);
		}
	},
});
