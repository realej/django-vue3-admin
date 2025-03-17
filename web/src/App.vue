<template>
	<el-config-provider :size="getGlobalComponentSize" :locale="getGlobalI18n">
		<!-- v-show="themeConfig.lockScreenTime > 1" -->
		<router-view v-show="themeConfig.lockScreenTime > 1" />
		<LockScreen v-if="themeConfig.isLockScreen" />
		<Setings ref="setingsRef" v-show="themeConfig.lockScreenTime > 1" />
		<CloseFull v-if="!themeConfig.isLockScreen" />
<!--		<Upgrade v-if="getVersion" />-->
	</el-config-provider>
</template>

<script setup lang="ts" name="app">
import { defineAsyncComponent, computed, ref, onBeforeMount, onMounted, onUnmounted, nextTick, watch, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import { Local, Session } from '/@/utils/storage';
import mittBus from '/@/utils/mitt';
import setIntroduction from '/@/utils/setIconfont';

// Introducing components
const LockScreen = defineAsyncComponent(() => import('/@/layout/lockScreen/index.vue'));
const Setings = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/setings.vue'));
const CloseFull = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/closeFull.vue'));
const Upgrade = defineAsyncComponent(() => import('/@/layout/upgrade/index.vue'));

// Define variable content
const { messages, locale } = useI18n();
const setingsRef = ref();
const route = useRoute();
const stores = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
import websocket from '/@/utils/websocket';
import { ElNotification } from 'element-plus';
// Get the version number
const getVersion = computed(() => {
	let isVersion = false;
	if (route.path !== '/login') {
		// @ts-ignore
		if ((Local.get('version') && Local.get('version') !== __VERSION__) || !Local.get('version')) isVersion = true;
	}
	return isVersion;
});
// Get global component size
const getGlobalComponentSize = computed(() => {
	return other.globalComponentSize();
});
// Get the global i18n
const getGlobalI18n = computed(() => {
	return messages.value[locale.value];
});
// Set initialization，Prevent the default recovery during refresh
onBeforeMount(() => {
	// Set up batch third parties icon icon
	setIntroduction.cssCdn();
	// Set up batch third parties js
	setIntroduction.jsCdn();
});
// When the page loads
onMounted(() => {
	nextTick(() => {
		// Monitor layout'Click to open the pop-up window
		mittBus.on('openSetingsDrawer', () => {
			setingsRef.value.openDrawer();
		});
		// Get the layout configuration in the cache
		if (Local.get('themeConfig')) {
			storesThemeConfig.setThemeConfig({ themeConfig: Local.get('themeConfig') });
			document.documentElement.style.cssText = Local.get('themeConfigStyle');
		}
		// Get full screen configuration in cache
		if (Session.get('isTagsViewCurrenFull')) {
			stores.setCurrenFullscreen(Session.get('isTagsViewCurrenFull'));
		}
	});
});
// When the page is destroyed，Turn off the monitoring layout configuration/i18nmonitor
onUnmounted(() => {
	mittBus.off('openSetingsDrawer', () => {});
});
// Listen to changes in routes，Set the website title
watch(
	() => route.path,
	() => {
		other.useTitle();
    other.useFavicon();
    if (!websocket.websocket) {
      //websockt Module
      try {
        websocket.init(wsReceive)
      } catch (e) {
        console.log('websocketmistake');
      }
    }
	},
	{
		deep: true,
	}
);

// websocketRelated Codes
import { messageCenterStore } from '/@/stores/messageCenter';
const wsReceive = (message: any) => {
	const data = JSON.parse(message.data);
	const { unread } = data;
	const messageCenter = messageCenterStore();
	messageCenter.setUnread(unread);
	if (data.contentType === 'SYSTEM') {
		ElNotification({
			title: 'System Message',
			message: data.content,
			type: 'success',
			position: 'bottom-right',
			duration: 5000,
		});
	}
};
onBeforeUnmount(() => {
	// Close the connection
	websocket.close();
});
</script>
