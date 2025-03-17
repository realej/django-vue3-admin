import { defineStore } from 'pinia';
import { DictionaryStates } from './interface';
import { request } from '../utils/service';

export const urlPrefix = '/api/init/dictionary/';
export const BUTTON_VALUE_TO_COLOR_MAPPING: any = {
	1: 'success',
	true: 'success',
	0: 'danger',
	false: 'danger',
	Search: 'warning', // Query
	Update: 'primary', // edit
	Create: 'success', // New
	Retrieve: 'info', // Single case
	Delete: 'danger', // delete
};

export function getButtonSettings(objectSettings: any) {
	return objectSettings.map((item: any) => ({
		label: item.label,
		value: item.value,
		color: item.color || BUTTON_VALUE_TO_COLOR_MAPPING[item.value],
	}));
}

/**
 * Dictionary management data
 * @methods getSystemDictionarys Get system dictionary data
 */
export const DictionaryStore = defineStore('Dictionary', {
	state: (): DictionaryStates => ({
		data: {},
	}),
	actions: {
		async getSystemDictionarys() {
			request({
				url: '/api/init/dictionary/?dictionary_key=all',
				method: 'get',
			}).then((ret: { data: [] }) => {
				// Convert data format and save topinia
				let dataList = ret.data;
				dataList.forEach((item: any) => {
					let childrens = item.children;
					// console.log(item);
					// this.data[item.value] = childrens;
					childrens.forEach((children:any, index:any) => {
						switch (children.type) {
							case 1:
								children.value = Number(children.value)
								break
							case 6:
								children.value = children.value === 'true'
								break
						}
					})
				this.data[item.value]=childrens
				});
			});
		},
	},
	persist: {
		enabled: true,
	},
});
