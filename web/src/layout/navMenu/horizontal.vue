<template>
	<div class="el-menu-horizontal-warp">
		<el-scrollbar @wheel.native.prevent="onElMenuHorizontalScroll" ref="elMenuHorizontalScrollRef">
			<el-menu router :default-active="state.defaultActive" :ellipsis="false" background-color="transparent" mode="horizontal">
				<template v-for="val in menuLists">
					<el-sub-menu :index="val.path" v-if="val.children && val.children.length > 0" :key="val.path">
						<template #title>
							<SvgIcon :name="val.meta.icon" />
							<span>{{ $t(val.meta.title) }}</span>
						</template>
						<SubItem :chil="val.children" />
					</el-sub-menu>
					<template v-else>
						<el-menu-item :index="val.path" :key="val.path">
							<template #title v-if="!val.meta.isLink || (val.meta.isLink && val.meta.isIframe)">
								<SvgIcon :name="val.meta.icon" />
								{{ $t(val.meta.title) }}
							</template>
							<template #title v-else>
								<a class="w100" @click.prevent="onALinkClick(val)">
									<SvgIcon :name="val.meta.icon" />
									{{ $t(val.meta.title) }}
								</a>
							</template>
						</el-menu-item>
					</template>
				</template>
			</el-menu>
		</el-scrollbar>
	</div>
</template>

<script setup lang="ts" name="navMenuHorizontal">
import { defineAsyncComponent, reactive, computed, onMounted, nextTick, onBeforeMount, ref } from 'vue';
import { useRoute, onBeforeRouteUpdate, RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useRoutesList } from '/@/stores/routesList';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import mittBus from '/@/utils/mitt';

// Introducing components
const SubItem = defineAsyncComponent(() => import('/@/layout/navMenu/subItem.vue'));

// Define the value passed by the parent component
const props = defineProps({
	// Menu List
	menuList: {
		type: Array<RouteRecordRaw>,
		default: () => [],
	},
});

// Define variable content
const elMenuHorizontalScrollRef = ref();
const stores = useRoutesList();
const storesThemeConfig = useThemeConfig();
const { routesList } = storeToRefs(stores);
const { themeConfig } = storeToRefs(storesThemeConfig);
const route = useRoute();
const state = reactive({
	defaultActive: '' as string | undefined,
});

// Get parent menu data
const menuLists = computed(() => {
	return <RouteItems>props.menuList;
});
// Set the horizontal scroll bar to scroll the mouse wheel
const onElMenuHorizontalScroll = (e: WheelEventType) => {
	const eventDelta = e.wheelDelta || -e.deltaY * 40;
	elMenuHorizontalScrollRef.value.$refs.wrapRef.scrollLeft = elMenuHorizontalScrollRef.value.$refs.wrapRef.scrollLeft + eventDelta / 4;
};
// Initialize data，When page refreshes，Scroll bars to the corresponding position
const initElMenuOffsetLeft = () => {
	nextTick(() => {
		let els = <HTMLElement>document.querySelector('.el-menu.el-menu--horizontal li.is-active');
		if (!els) return false;
		elMenuHorizontalScrollRef.value.$refs.wrapRef.scrollLeft = els.offsetLeft;
	});
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
	filterRoutesFun(routesList.value).map((v, k) => {
		if (v.path === `/${currentPathSplit[1]}`) {
			v['k'] = k;
			currentData['item'] = { ...v };
			currentData['children'] = [{ ...v }];
			if (v.children) currentData['children'] = v.children;
		}
	});
	return currentData;
};
// The current route of the setting page is highlighted
const setCurrentRouterHighlight = (currentRoute: RouteToFrom) => {
	const { path, meta } = currentRoute;
	if (themeConfig.value.layout === 'classic') {
		state.defaultActive = `/${path?.split('/')[1]}`;
	} else {
		const pathSplit = meta?.isDynamic ? meta.isDynamicPath!.split('/') : path!.split('/');
		if (pathSplit.length >= 4 && meta?.isHide) state.defaultActive = pathSplit.splice(0, 3).join('/');
		else state.defaultActive = path;
	}
};
// Open an external link
const onALinkClick = (val: RouteItem) => {
	other.handleOpenLink(val);
};
// Before the page loads
onBeforeMount(() => {
	setCurrentRouterHighlight(route);
});
// When the page loads
onMounted(() => {
	initElMenuOffsetLeft();
});
// When routing updates
onBeforeRouteUpdate((to) => {
	// repair：https://gitee.com/lyt-top/vue-next-admin/issues/I3YX6G
	setCurrentRouterHighlight(to);
	// Fixed classic layout when opening the cutting menu，ClicktagsViewThe problem of the data of the navigation menu on the left side of the back remains unchanged
	let { layout, isClassicSplitMenu } = themeConfig.value;
	if (layout === 'classic' && isClassicSplitMenu) {
		mittBus.emit('setSendClassicChildren', setSendClassicChildren(to.path));
	}
});
</script>

<style scoped lang="scss">
.el-menu-horizontal-warp {
	flex: 1;
	overflow: hidden;
	margin-right: 30px;
	:deep(.el-scrollbar__bar.is-vertical) {
		display: none;
	}
	:deep(a) {
		width: 100%;
	}
	.el-menu.el-menu--horizontal {
		display: flex;
		height: 100%;
		width: 100%;
		box-sizing: border-box;
	}
}
</style>
