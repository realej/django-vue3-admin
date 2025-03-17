import { defineStore } from 'pinia';

/**
 * Layout configuration
 * repair：https://gitee.com/lyt-top/vue-next-admin/issues/I567R1，grateful@lanbao123
 * 2020.05.28 by lyt optimization。Problem of not taking effect during development
 * When modifying configuration：
 * 1、Need to be cleaned every time `window.localStorage` Browser permanent cache
 * 2、Or click on the bottom of the layout configuration `One-click to restore the default` The button will see the effect
 */
export const useThemeConfig = defineStore('themeConfig', {
	state: (): ThemeConfigState => ({
		themeConfig: {
			// Whether to open the layout configuration drawer
			isDrawer: false,

			/**
			 * Global Topic
			 */
			// default primary Theme color
			primary: '#409eff',
			// Whether to enable dark mode
			isIsDark: false,

			/**
			 * Top bar settings
			 */
			// Default top bar navigation background color
			topBar: '#ffffff',
			// Default top bar navigation font color
			topBarColor: '#606266',
			// Whether to enable the color gradient of the top bar background
			isTopBarColorGradual: false,

			/**
			 * Menu Settings
			 */
			// Default menu navigation background color
			menuBar: '#334054',
			// Default menu navigation font color
			menuBarColor: '#eaeaea',
			// Default menu highlight background color
			menuBarActiveColor: 'rgba(0, 0, 0, 0.2)',
			// Whether to enable the menu background color gradient
			isMenuBarColorGradual: false,

			/**
			 * Column settings
			 */
			// Default column menu background color
			columnsMenuBar: '#334054',
			// Default column menu font color
			columnsMenuBarColor: '#e6e6e6',
			// Whether to enable the background color gradient of the column menu
			isColumnsMenuBarColorGradual: false,
			// Whether to enable the column menu mouse hover preload(Preview menu)
			isColumnsMenuHoverPreload: false,

			/**
			 * Interface settings
			 */
			// Whether to enable the horizontal folding effect of the menu
			isCollapse: false,
			// Whether to turn on the menu accordion effect
			isUniqueOpened: true,
			// Whether to enable fixed Header
			isFixedHeader: false,
			// Initialize variables，Used to update menus el-scrollbar The height of，Please do not delete
			isFixedHeaderChange: false,
			// Whether to enable the classic layout split menu（Only classic layouts take effect）
			isClassicSplitMenu: false,
			// Whether to enable the automatic lock screen
			isLockScreen: false,
			// Turn on the automatic lock screen countdown(s/Second)
			lockScreenTime: 30,

			/**
			 * Interface display
			 */
			// Whether to open the sidebar Logo
			isShowLogo: true,
			// Initialize variables，For el-scrollbar Highly updated，Please do not delete
			isShowLogoChange: false,
			// Whether to enable Breadcrumb，Forced Classic、Horizontal layout not displayed
			isBreadcrumb: true,
			// Whether to enable Tagsview
			isTagsview: true,
			// Whether to enable Breadcrumb icon
			isBreadcrumbIcon: true,
			// Whether to enable Tagsview icon
			isTagsviewIcon: true,
			// Whether to enable TagsView cache
			isCacheTagsView: true,
			// Whether to enable TagsView Drag and drag
			isSortableTagsView: true,
			// Whether to enable TagsView Shared
			isShareTagsView: false,
			// Whether to enable Footer Bottom copyright information
			isFooter: true,
			// Whether to enable gray mode
			isGrayscale: false,
			// Whether to enable the color weak mode
			isInvert: false,
			// Whether to turn on the watermark
			isWartermark: false,
			// Watermark copy
			wartermarkText: '',

			/**
			 * Other settings
			 */
			// Tagsview style：Optional value"<tags-style-one|tags-style-four|tags-style-five>"，default tags-style-five
			// The value defined and `/src/layout/navBars/tagsView/tagsView.vue` In-house class The same name
			tagsStyle: 'tags-style-five',
			// Home page switching animation：Optional value"<slide-right|slide-left|opacitys>"，default slide-right
			animation: 'slide-right',
			// Column highlight style：Optional value"<columns-round|columns-card>"，default columns-round
			columnsAsideStyle: 'columns-round',
			// Column layout style：Optional value"<columns-horizontal|columns-vertical>"，default columns-horizontal
			columnsAsideLayout: 'columns-vertical',

			/**
			 * Layout Switch
			 * Notice：For demonstration，When switching layout，The color will be restored to default，Code location：/@/layout/navBars/breadcrumb/setings.vue
			 * In-house `initSetLayoutChange(Set layout switching，Reset theme style)` method
			 */
			// Layout Switch：Optional value"<defaults|classic|transverse|columns>"，default defaults
			layout: 'defaults',

			/**
			 * Backend control routing
			 */
			// Whether to enable backend control routing
			isRequestRoutes: true,

			/**
			 * Global website title / subtitle
			 */
			// Website main title（Menu Navigation、Browser's current web page title）
			globalTitle: 'DVAdmin',
			// Website subtitle（Text at the top of the login page）
			globalViceTitle: 'DVAdmin',
			// Website subtitle（Text at the top of the login page）
			globalViceTitleMsg: 'Enterprise-level rapid development platform',
			// Default initial language，Optional value"<zh-cn|en|zh-tw>"，default zh-cn
			globalI18n: 'zh-cn',
			// Default global component size，Optional value"<large|'default'|small>"，default 'large'
			globalComponentSize: 'default',
		},
	}),
	actions: {
		setThemeConfig(data: ThemeConfigState) {
			this.themeConfig = data.themeConfig;
		},
	},
});
