/**
 * Define an interface to define the type of an object
 * `stores` All types are defined here
 */
import {useFrontendMenuStore} from "/@/stores/frontendMenu";

// User Information
export interface UserInfosState {
	avatar: string;
	username: string;
	name: string;
	email: string;
	mobile: string;
	gender: string;
	pwd_change_count:null|number;
	dept_info: {
		dept_id: number;
		dept_name: string;
	};
	role_info: any[];
}
export interface UserInfosStates {
	userInfos: UserInfosState;
	isSocketOpen: boolean
}

// Routing cache list
export interface KeepAliveNamesState {
	keepAliveNames: string[];
	cachedViews: string[];
}

// Backend returns to the original route(When unprocessed)
export interface RequestOldRoutesState {
	requestOldRoutes: string[];
}

// TagsView Routing list
export interface TagsViewRoutesState {
	tagsViewRoutes: string[];
	isTagsViewCurrenFull: Boolean;
}

// Routing list
export interface RoutesListState {
	routesList: string[];
	isColumnsMenuHover: Boolean;
	isColumnsNavHover: Boolean;
}

// Layout configuration
export interface ThemeConfigState {
	isDrawer: boolean;
	primary: string;
	topBar: string;
	topBarColor: string;
	isTopBarColorGradual: boolean;
	menuBar: string;
	menuBarColor: string;
	isMenuBarColorGradual: boolean;
	columnsMenuBar: string;
	columnsMenuBarColor: string;
	isColumnsMenuBarColorGradual: boolean;
	isCollapse: boolean;
	isUniqueOpened: boolean;
	isFixedHeader: boolean;
	isFixedHeaderChange: boolean;
	isClassicSplitMenu: boolean;
	isLockScreen: boolean;
	lockScreenTime: number;
	isShowLogo: boolean;
	isShowLogoChange: boolean;
	isBreadcrumb: boolean;
	isTagsview: boolean;
	isBreadcrumbIcon: boolean;
	isTagsviewIcon: boolean;
	isCacheTagsView: boolean;
	isSortableTagsView: boolean;
	isShareTagsView: boolean;
	isFooter: boolean;
	isGrayscale: boolean;
	isInvert: boolean;
	isIsDark: boolean;
	isWartermark: boolean;
	wartermarkText: string;
	tagsStyle: string;
	animation: string;
	columnsAsideStyle: string;
	columnsAsideLayout: string;
	layout: string;
	isRequestRoutes: boolean;
	globalTitle: string;
	globalViceTitle: string;
	globalI18n: string;
	globalComponentSize: string;
}
export interface ThemeConfigStates {
	themeConfig: ThemeConfigState;
}

export interface DictionaryStates {
	data: any;
}
export interface ConfigStates {
	systemConfig: any;
}

export interface FrontendMenu {
	arrayRouter: Array<any>;
	treeRouter:Array<any>;

	frameOutRoutes:Array<any>;

	frameInRoutes:Array<any>;
}
