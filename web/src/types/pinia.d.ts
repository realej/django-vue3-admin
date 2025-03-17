/**
 * pinia Type definition
 */

// User Information
declare interface UserInfosState<T = any> {
	userInfos: {
		authBtnList: string[];
		photo: string;
		roles: string[];
		time: number;
		username: string;
		[key: string]: T;
	};
}

// Routing cache list
declare interface KeepAliveNamesState {
	keepAliveNames: string[];
	cachedViews: string[];
}

// Backend returns to the original route(When unprocessed)
declare interface RequestOldRoutesState {
	requestOldRoutes: string[];
}

// TagsView Routing list
declare interface TagsViewRoutesState<T = any> {
	tagsViewRoutes: T[];
	isTagsViewCurrenFull: Boolean;
}

// Routing list
declare interface RoutesListState<T = any> {
	routesList: T[];
	isColumnsMenuHover: Boolean;
	isColumnsNavHover: Boolean;
}

// Layout configuration
declare interface ThemeConfigState {
	themeConfig: {
		isDrawer: boolean;
		primary: string;
		topBar: string;
		topBarColor: string;
		isTopBarColorGradual: boolean;
		menuBar: string;
		menuBarColor: string;
		menuBarActiveColor: string;
		isMenuBarColorGradual: boolean;
		columnsMenuBar: string;
		columnsMenuBarColor: string;
		isColumnsMenuBarColorGradual: boolean;
		isColumnsMenuHoverPreload: boolean;
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
		globalViceTitleMsg: string;
		globalI18n: string;
		globalComponentSize: string;
	};
}
