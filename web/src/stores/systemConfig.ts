import { defineStore } from 'pinia';
import { ConfigStates } from './interface';
import { request } from '../utils/service';
export const urlPrefix = '/api/init/settings/';

/**
 * System configuration data
 * @methods getSystemConfig Obtain system configuration data
 */
export const SystemConfigStore = defineStore('SystemConfig', {
	state: (): ConfigStates => ({
		systemConfig: {},
	}),
	actions: {
		async getSystemConfigs() {
			request({
				url: urlPrefix,
				method: 'get',
			}).then((ret: { data: [] }) => {
				// Convert data format and save topinia
				this.systemConfig = JSON.parse(JSON.stringify(ret.data));
			});
		},
	},
	persist: {
		enabled: true,
	},
});
