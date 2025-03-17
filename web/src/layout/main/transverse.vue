<template>
	<el-container class="layout-container flex-center layout-backtop">
		<LayoutHeader />
		<LayoutMain ref="layoutMainRef" />
	</el-container>
</template>

<script setup lang="ts" name="layoutTransverse">
import { defineAsyncComponent, ref, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';

// Introducing components
const LayoutHeader = defineAsyncComponent(() => import('/@/layout/component/header.vue'));
const LayoutMain = defineAsyncComponent(() => import('/@/layout/component/main.vue'));

// Define variable content
const layoutMainRef = ref<InstanceType<typeof LayoutMain>>();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const route = useRoute();

// Reset scrollbar height，Update child level scrollbar
const updateScrollbar = () => {
	layoutMainRef.value!.layoutMainScrollbarRef.update();
};
// Reset scrollbar height，Since the components are introduced asynchronously
const initScrollBarHeight = () => {
	nextTick(() => {
		setTimeout(() => {
			updateScrollbar();
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
