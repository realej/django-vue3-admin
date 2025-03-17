<template>
	<el-container class="layout-container">
		<ColumnsAside />
		<el-container class="layout-columns-warp layout-container-view h100">
			<LayoutAside />
			<el-scrollbar ref="layoutScrollbarRef" class="layout-backtop">
				<LayoutHeader />
				<LayoutMain ref="layoutMainRef" />
			</el-scrollbar>
		</el-container>
	</el-container>
</template>

<script setup lang="ts" name="layoutColumns">
import { defineAsyncComponent, watch, onMounted, nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';

// Introducing components
const LayoutAside = defineAsyncComponent(() => import('/@/layout/component/aside.vue'));
const LayoutHeader = defineAsyncComponent(() => import('/@/layout/component/header.vue'));
const LayoutMain = defineAsyncComponent(() => import('/@/layout/component/main.vue'));
const ColumnsAside = defineAsyncComponent(() => import('/@/layout/component/columnsAside.vue'));

// Define variable content
const layoutScrollbarRef = ref<RefType>('');
const layoutMainRef = ref<InstanceType<typeof LayoutMain>>();
const route = useRoute();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// Reset scrollbar height
const updateScrollbar = () => {
	// Update parent scrollbar
	layoutScrollbarRef.value.update();
	// Update child level scrollbar
	layoutMainRef.value!.layoutMainScrollbarRef.update();
};
// Reset scrollbar height，Since the components are introduced asynchronously
const initScrollBarHeight = () => {
	nextTick(() => {
		setTimeout(() => {
			updateScrollbar();
			layoutScrollbarRef.value.wrapRef.scrollTop = 0;
			layoutMainRef.value!.layoutMainScrollbarRef.wrapRef.scrollTop = 0;
		}, 500);
	});
};
// When the page loads
onMounted(() => {
	initScrollBarHeight();
});
// Listen to changes in routes，When switching interface，Scroll bar top
watch(
	() => route.path,
	() => {
		initScrollBarHeight();
	}
);
// monitor themeConfig Changes in configuration files，Update menu el-scrollbar The height of
watch(
	themeConfig,
	() => {
		updateScrollbar();
	},
	{
		deep: true,
	}
);
</script>
