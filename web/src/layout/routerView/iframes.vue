<template>
	<div class="layout-padding layout-padding-unset layout-iframe">
		<div class="layout-padding-auto layout-padding-view">
			<div class="w100" v-for="v in setIframeList" :key="v.path" v-loading="v.meta.loading" element-loading-background="white">
				<transition-group :name="name" mode="out-in">
					<iframe
						:src="v.meta.isLink"
						:key="v.path"
						frameborder="0"
						height="100%"
						width="100%"
						style="position: absolute"
						:data-url="v.path"
						v-show="getRoutePath === v.path"
						ref="iframeRef"
					/>
				</transition-group>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutIframeView">
import { computed, watch, ref, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import {cookie} from "xe-utils";

// Define the value passed by the parent component
const props = defineProps({
	// refresh iframe
	refreshKey: {
		type: String,
		default: () => '',
	},
	// Transition animation name
	name: {
		type: String,
		default: () => 'slide-right',
	},
	// iframe List
	list: {
		type: Array,
		default: () => [],
	},
});

// Define variable content
const iframeRef = ref();
const route = useRoute();

// deal with list List，When open，Loading
const setIframeList = computed(() => {
	return (<RouteItems>props.list).filter((v: RouteItem) => {
    if (v.meta?.isIframeOpen) {
        const isLink = v.meta?.isLink || '';
      	if (isLink.includes("{{token}}")) {
          v.meta.isLink = isLink.replace("{{token}}", cookie.get('token'))
        }
    }
    return v.meta?.isIframeOpen
  });
});
// Get iframe Current routing path
const getRoutePath = computed(() => {
	return route.path;
});
// closure iframe loading
const closeIframeLoading = (val: string, item: RouteItem) => {
	nextTick(() => {
		if (!iframeRef.value) return false;
		iframeRef.value.forEach((v: HTMLElement) => {
			if (v.dataset.url === val) {
				v.onload = () => {
					if (item.meta?.isIframeOpen && item.meta.loading) item.meta.loading = false;
				};
			}
		});
	});
};
// Listen to routing changes，initialization iframe data，Prevent multiple iframe hour，The switch does not take effect
watch(
	() => route.fullPath,
	(val) => {
		const item: any = props.list.find((v: any) => v.path === val);
		if (!item) return false;
		if (!item.meta.isIframeOpen) item.meta.isIframeOpen = true;
		closeIframeLoading(val, item);
	},
	{
		immediate: true,
	}
);
// monitor iframe refreshKey change，For tagsview Right-click menu refresh
watch(
	() => props.refreshKey,
	() => {
		const item: any = props.list.find((v: any) => v.path === route.path);
		if (!item) return false;
		if (item.meta.isIframeOpen) item.meta.isIframeOpen = false;
		setTimeout(() => {
			item.meta.isIframeOpen = true;
			item.meta.loading = true;
			closeIframeLoading(route.fullPath, item);
		});
	},
	{
		deep: true,
	}
);
</script>
