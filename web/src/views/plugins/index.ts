import { defineAsyncComponent, AsyncComponentLoader } from 'vue';
export let pluginsAll: any = [];
// Scan the plugin directory and register the plugin
export const scanAndInstallPlugins = (app: any) => {
	const components = import.meta.glob('./**/*.vue');
	const pluginNames = new Set();
	// Iterate through the object and register asynchronous components
	for (const [key, value] of Object.entries(components)) {
		const name = key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
		app.component(name, defineAsyncComponent(value as AsyncComponentLoader));
		const pluginsName = key.match(/\/([^\/]*)\//)?.[1];
		pluginNames.add(pluginsName);
	}
	pluginsAll = Array.from(pluginNames);
	console.log('Plugins discovered：', pluginsAll);
};
