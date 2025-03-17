// Declare external npm Plug-in module
declare module 'vue-grid-layout';
declare module 'qrcodejs2-fixes';
declare module 'splitpanes';
declare module 'js-cookie';
declare module '@wangeditor/editor-for-vue';
declare module 'js-table2excel';
declare module 'qs';

// Declare a module，Prevent errors from being reported when introducing files
declare module '*.json';
declare module '*.png';
declare module '*.jpg';
declare module '*.scss';
declare module '*.ts';
declare module '*.js';

// Declaration file，*.vue Suffix file to vue Module to handle
declare module '*.vue' {
	import type { DefineComponent } from 'vue';
	const component: DefineComponent<{}, {}, any>;
	export default component;
}

// Declaration file，Define global variables
/* eslint-disable */
declare interface Window {
	nextLoading: boolean;
}

// Declare the current item type of route
declare type RouteItem<T = any> = {
	path: string;
	name?: string | symbol | undefined | null;
	redirect?: string;
	k?: T;
	meta?: {
		title?: string;
		isLink?: string;
		isHide?: boolean;
		isKeepAlive?: boolean;
		isAffix?: boolean;
		isIframe?: boolean;
		roles?: string[];
		icon?: string;
		isDynamic?: boolean;
		isDynamicPath?: string;
		isIframeOpen?: string;
		loading?: boolean;
	};
	children: T[];
	query?: { [key: string]: T };
	params?: { [key: string]: T };
	contextMenuClickId?: string | number;
	commonUrl?: string;
	isFnClick?: boolean;
	url?: string;
	transUrl?: string;
	title?: string;
	id?: string | number;
};

// Declare the route to from
declare interface RouteToFrom<T = any> extends RouteItem {
	path?: string;
	children?: T[];
}

// Declare the routing of the current item type collection
declare type RouteItems<T extends RouteItem = any> = T[];

// statement ref
declare type RefType<T = any> = T | null;

// statement HTMLElement
declare type HtmlType = HTMLElement | string | undefined | null;

// Statement children Optional
declare type ChilType<T = any> = {
	children?: T[];
};

// Statement Array
declare type EmptyArrayType<T = any> = T[];

// Statement Object
declare type EmptyObjectType<T = any> = {
	[key: string]: T;
};

// Statement select option
declare type SelectOptionType = {
	value: string | number;
	label: string | number;
};

// Mouse wheel scroll type
declare interface WheelEventType extends WheelEvent {
	wheelDelta: number;
}

// table Data format public type
declare interface TableType<T = any> {
	total: number;
	loading: boolean;
	param: {
		pageNum: number;
		pageSize: number;
		[key: string]: T;
	};
}
