/* eslint-disable */

// Declaration file，*.vue Suffix file to vue Module to handle
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

// Declaration file，Define global variables。other app.config.globalProperties.xxx，use getCurrentInstance() Come and get it
interface Window {
	nextLoading: boolean;
}
