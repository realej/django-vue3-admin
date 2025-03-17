/**
 * mitt Event type definition
 *
 * @method openSetingsDrawer Open the layout settings pop-up window
 * @method restoreDefault Column layout，Move in、Move out data display
 * @method setSendColumnsChildren Column layout，Move in、Move out menu data into navMenu In the menu below
 * @method setSendClassicChildren Classic layout，Error 500 (Server Error)!!1500.That’s an error.There was an error. Please try again later.That’s all we know.，Menu data is passed to navMenu In the menu below
 * @method getBreadcrumbIndexSetFilterRoutes Error 500 (Server Error)!!1500.That’s an error.There was an error. Please try again later.That’s all we know.，When the cutting menu is turned on，Menu data is passed to navMenu In the menu below
 * @method layoutMobileResize When the browser window changes，Used to adapt to mobile interface display
 * @method openOrCloseSortable Layout settings pop-up window，Open TagsView Drag and drag
 * @method openShareTagsView Layout settings pop-up window，Open TagsView Shared
 * @method onTagsViewRefreshRouterView tagsview Refresh the interface
 * @method onCurrentContextmenuClick tagsview Whenever the right-click menu is clicked
 */
declare type MittType<T = any> = {
	openSetingsDrawer?: string;
	restoreDefault?: string;
	setSendColumnsChildren: T;
	setSendClassicChildren: T;
	getBreadcrumbIndexSetFilterRoutes?: string;
	layoutMobileResize: T;
	openOrCloseSortable?: string;
	openShareTagsView?: string;
	onTagsViewRefreshRouterView?: T;
	onCurrentContextmenuClick?: T;
};

// mitt Parameter type definition
declare type LayoutMobileResize = {
	layout: string;
	clientWidth: number;
};

// mitt Parameter menu type
declare type MittMenu = {
	children: RouteRecordRaw[];
	item?: RouteItem;
};
