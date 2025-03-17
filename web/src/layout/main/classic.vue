<template>
	<el-container class="layout-container flex-center">
		<LayoutHeader />
		<el-container class="layout-mian-height-50">
			<LayoutAside />
			<div class="flex-center layout-backtop">
				<LayoutTagsView v-if="isTagsview" />
				<LayoutMain ref="layoutMainRef" />
			</div>
		</el-container>
	</el-container>
</template>

<script setup lang="ts" name="layoutClassic">
import { defineAsyncComponent, computed, ref, watch, nextTick, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';

// Introducing components
const LayoutAside = defineAsyncComponent(() => import('/@/layout/component/aside.vue'));
const LayoutHeader = defineAsyncComponent(() => import('/@/layout/component/header.vue'));
const LayoutMain = defineAsyncComponent(() => import('/@/layout/component/main.vue'));
const LayoutTagsView = defineAsyncComponent(() => import('/@/layout/navBars/tagsView/tagsView.vue'));

// Define variable content
const layoutMainRef = ref<InstanceType<typeof LayoutMain>>();
const route = useRoute();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// Determine whether it is displayed tasgview
const isTagsview = computed(() => {
	return themeConfig.value.isTagsview;
});
// Reset scrollbar height，Update child level scrollbar
const updateScrollbar = () => {
	layoutMainRef.value?.layoutMainScrollbarRef.update();
};
// Reset scrollbar height，Since the components are introduced asynchronously
const initScrollBarHeight = () => {
	nextTick(() => {
		setTimeout(() => {
			updateScrollbar();
			// '!' not null Assertion operator，No runtime checking is performed
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
