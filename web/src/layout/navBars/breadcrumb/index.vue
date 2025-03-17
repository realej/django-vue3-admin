<template>
	<div class="layout-navbars-breadcrumb-index">
		<Logo v-if="setIsShowLogo" />
		<Breadcrumb />
		<Horizontal :menuList="state.menuList" v-if="isLayoutTransverse" />
		<User />
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbIndex">
import { defineAsyncComponent, computed, reactive, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useRoutesList } from '/@/stores/routesList';
import { useThemeConfig } from '/@/stores/themeConfig';
import mittBus from '/@/utils/mitt';

// Introducing components
const Breadcrumb = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/breadcrumb.vue'));
const User = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/user.vue'));
const Logo = defineAsyncComponent(() => import('/@/layout/logo/index.vue'));
const Horizontal = defineAsyncComponent(() => import('/@/layout/navMenu/horizontal.vue'));

// Define variable content
const stores = useRoutesList();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { routesList } = storeToRefs(stores);
const route = useRoute();
const state = reactive({
	menuList: [] as RouteItems,
});

// set up logo show/hide
const setIsShowLogo = computed(() => {
	let { isShowLogo, layout } = themeConfig.value;
	return (isShowLogo && layout === 'classic') || (isShowLogo && layout === 'transverse');
});
// Set whether to display the horizontal navigation menu
const isLayoutTransverse = computed(() => {
	let { layout, isClassicSplitMenu } = themeConfig.value;
	return layout === 'transverse' || (isClassicSplitMenu && layout === 'classic');
});
// set up/Filter routing（Non-static routing/Whether it is displayed in the menu）
const setFilterRoutes = () => {
	let { layout, isClassicSplitMenu } = themeConfig.value;
	if (layout === 'classic' && isClassicSplitMenu) {
		state.menuList = delClassicChildren(filterRoutesFun(routesList.value));
		const resData = setSendClassicChildren(route.path);
		mittBus.emit('setSendClassicChildren', resData);
	} else {
		state.menuList = filterRoutesFun(routesList.value);
	}
};
// When the split menu is set，Delete the bottom children
const delClassicChildren = <T extends ChilType>(arr: T[]): T[] => {
	arr.map((v: T) => {
		if (v.children) delete v.children;
	});
	return arr;
};
// Routing filtering recursive functions
const filterRoutesFun = <T extends RouteItem>(arr: T[]): T[] => {
	return arr
		.filter((item: T) => !item.meta?.isHide)
		.map((item: T) => {
			item = Object.assign({}, item);
			if (item.children) item.children = filterRoutesFun(item.children);
			return item;
		});
};
// Transfer current child data to the menu
const setSendClassicChildren = (path: string) => {
	const currentPathSplit = path.split('/');
	let currentData: MittMenu = { children: [] };
	filterRoutesFun(routesList.value).map((v: RouteItem, k: number) => {
		if (v.path === `/${currentPathSplit[1]}`) {
			v['k'] = k;
			currentData['item'] = { ...v };
			currentData['children'] = [{ ...v }];
			if (v.children) currentData['children'] = v.children;
		}
	});
	return currentData;
};
// When the page loads
onMounted(() => {
	setFilterRoutes();
	mittBus.on('getBreadcrumbIndexSetFilterRoutes', () => {
		setFilterRoutes();
	});
});
// When the page is uninstalled
onUnmounted(() => {
	mittBus.off('getBreadcrumbIndexSetFilterRoutes', () => {});
});
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-index {
	height: 50px;
	display: flex;
	align-items: center;
	background: var(--next-bg-topBar);
	border-bottom: 1px solid var(--next-border-color-light);
}
</style>
