<template>
	<div class="layout-navbars-breadcrumb-user pr15" :style="{ flex: layoutUserFlexNum }">
		<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onComponentSizeChange">
			<div class="layout-navbars-breadcrumb-user-icon">
				<i class="iconfont icon-ziti" :title="$t('message.user.title0')"></i>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="large" :disabled="state.disabledSize === 'large'">{{ $t('message.user.dropdownLarge') }}</el-dropdown-item>
					<el-dropdown-item command="default" :disabled="state.disabledSize === 'default'">{{ $t('message.user.dropdownDefault') }}</el-dropdown-item>
					<el-dropdown-item command="small" :disabled="state.disabledSize === 'small'">{{ $t('message.user.dropdownSmall') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onLanguageChange">
			<div class="layout-navbars-breadcrumb-user-icon">
				<i
					class="iconfont"
					:class="state.disabledI18n === 'en' ? 'icon-fuhao-yingwen' : 'icon-fuhao-zhongwen'"
					:title="$t('message.user.title1')"
				></i>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="zh-cn" :disabled="state.disabledI18n === 'zh-cn'">Simplified Chinese</el-dropdown-item>
					<el-dropdown-item command="en" :disabled="state.disabledI18n === 'en'">English</el-dropdown-item>
					<el-dropdown-item command="zh-tw" :disabled="state.disabledI18n === 'zh-tw'">繁體中文</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<div class="layout-navbars-breadcrumb-user-icon" @click="onSearchClick">
			<el-icon :title="$t('message.user.title2')">
				<ele-Search />
			</el-icon>
		</div>
		<div class="layout-navbars-breadcrumb-user-icon" @click="onLayoutSetingClick">
			<i class="icon-skin iconfont" :title="$t('message.user.title3')"></i>
		</div>
		<div class="layout-navbars-breadcrumb-user-icon">
			<el-popover placement="bottom" trigger="click" transition="el-zoom-in-top" :width="300" :persistent="false">
				<template #reference>
					<el-badge :value="messageCenter.unread" :hidden="messageCenter.unread === 0">
						<el-icon :title="$t('message.user.title4')">
							<ele-Bell />
						</el-icon>
					</el-badge>
				</template>
				<template #default>
					<UserNews />
				</template>
			</el-popover>
		</div>
		<div class="layout-navbars-breadcrumb-user-icon mr10" @click="onScreenfullClick">
			<i
				class="iconfont"
				:title="state.isScreenfull ? $t('message.user.title6') : $t('message.user.title5')"
				:class="!state.isScreenfull ? 'icon-fullscreen' : 'icon-tuichuquanping'"
			></i>
		</div>
    <div>
      <span v-if="!isSocketOpen">
        <el-popconfirm
          width="250"
          ref="onlinePopoverRef"
          :confirm-button-text="$t('message.user.retry')"
          :icon="InfoFilled"
          trigger="hover"
          icon-color="#626AEF"
          :title="$t('message.user.onlinePrompt')"
          @confirm="onlineConfirmEvent"
        >
          <template #reference>
            <el-badge is-dot class="item" :class="{'online-status': isSocketOpen,'online-down':!isSocketOpen}">
              <img :src="userInfos.avatar || headerImage" class="layout-navbars-breadcrumb-user-link-photo mr5" />
            </el-badge>
          </template>
        </el-popconfirm>
      </span>
    </div>
		<el-dropdown :show-timeout="70" :hide-timeout="50" @command="onHandleCommandClick">
			<span class="layout-navbars-breadcrumb-user-link">
        <span v-if="isSocketOpen">
          <el-badge is-dot class="item" :class="{'online-status': isSocketOpen,'online-down':!isSocketOpen}">
            <img :src="userInfos.avatar || headerImage" class="layout-navbars-breadcrumb-user-link-photo mr5" />
          </el-badge>
        </span>
				{{ userInfos.username === '' ? 'common' : userInfos.username }}
				<el-icon class="el-icon--right">
					<ele-ArrowDown />
				</el-icon>
			</span>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="/home">{{ $t('message.user.dropdown1') }}</el-dropdown-item>
					<el-dropdown-item command="/personal">{{ $t('message.user.dropdown2') }}</el-dropdown-item>
					<el-dropdown-item command="wareHouse">{{ $t('message.user.dropdown6') }}</el-dropdown-item>
					<el-dropdown-item divided command="logOut">{{ $t('message.user.dropdown5') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
		<Search ref="searchRef" />
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUser">
import { defineAsyncComponent, ref, computed, reactive, onMounted, unref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessageBox, ElMessage } from 'element-plus';
import screenfull from 'screenfull';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useUserInfo } from '/@/stores/userInfo';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import mittBus from '/@/utils/mitt';
import { Session, Local } from '/@/utils/storage';
import headerImage from '/@/assets/img/headerImage.png';
import websocket from '/@/utils/websocket';
import { InfoFilled } from '@element-plus/icons-vue'
// Introducing components
const UserNews = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/userNews.vue'));
const Search = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/search.vue'));

// Define variable content
const { locale, t } = useI18n();
const router = useRouter();
const stores = useUserInfo();
const storesThemeConfig = useThemeConfig();
const { userInfos } = storeToRefs(stores);
const { themeConfig } = storeToRefs(storesThemeConfig);
const searchRef = ref();
const state = reactive({
	isScreenfull: false,
	disabledI18n: 'zh-cn',
	disabledSize: 'large',
});

// Set split style
const layoutUserFlexNum = computed(() => {
	let num: string | number = '';
	const { layout, isClassicSplitMenu } = themeConfig.value;
	const layoutArr: string[] = ['defaults', 'columns'];
	if (layoutArr.includes(layout) || (layout === 'classic' && !isClassicSplitMenu)) num = '1';
	else num = '';
	return num;
});

// Define variable content
const { isSocketOpen } = storeToRefs(useUserInfo());

// websocketstate
const onlinePopoverRef = ref()
const onlineConfirmEvent = () => {
  if (!isSocketOpen.value) {
      websocket.is_reonnect = true
      websocket.reconnect_current = 1
      websocket.reconnect()
  }
  // Manually hide pop-up
  unref(onlinePopoverRef).popperRef?.delayHide?.()
}
// When clicking on full screen
const onScreenfullClick = () => {
	if (!screenfull.isEnabled) {
		ElMessage.warning('Full screen is not supported yet');
		return false;
	}
	screenfull.toggle();
	screenfull.on('change', () => {
		if (screenfull.isFullscreen) state.isScreenfull = true;
		else state.isScreenfull = false;
	});
};
// Layout configuration icon When clicked
const onLayoutSetingClick = () => {
	mittBus.emit('openSetingsDrawer');
};
// When the drop-down menu is clicked
const onHandleCommandClick = (path: string) => {
	if (path === 'logOut') {
		ElMessageBox({
			closeOnClickModal: false,
			closeOnPressEscape: false,
			title: t('message.user.logOutTitle'),
			message: t('message.user.logOutMessage'),
			showCancelButton: true,
			confirmButtonText: t('message.user.logOutConfirm'),
			cancelButtonText: t('message.user.logOutCancel'),
			buttonSize: 'default',
			beforeClose: (action, instance, done) => {
				if (action === 'confirm') {
					instance.confirmButtonLoading = true;
					instance.confirmButtonText = t('message.user.logOutExit');
					setTimeout(() => {
						done();
						setTimeout(() => {
							instance.confirmButtonLoading = false;
						}, 300);
					}, 700);
				} else {
					done();
				}
			},
		})
			.then(async () => {
				// Clear cache/tokenwait
				Session.clear();
				// use reload hour，No call required resetRoute() Reset the routing
				window.location.reload();
			})
			.catch(() => {});
	} else if (path === 'wareHouse') {
		window.open('https://gitee.com/huge-dream/django-vue3-admin');
	} else {
		router.push(path);
	}
};
// Menu Search Click
const onSearchClick = () => {
	searchRef.value.openSearch();
};
// Component size changes
const onComponentSizeChange = (size: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalComponentSize = size;
	Local.set('themeConfig', themeConfig.value);
	initI18nOrSize('globalComponentSize', 'disabledSize');
	window.location.reload();
};
// Language Switching
const onLanguageChange = (lang: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
	other.useTitle();
	initI18nOrSize('globalI18n', 'disabledI18n');
};
// Initialize component size/i18n
const initI18nOrSize = (value: string, attr: string) => {
	state[attr] = Local.get('themeConfig')[value];
};
// When the page loads
onMounted(() => {
	if (Local.get('themeConfig')) {
		initI18nOrSize('globalComponentSize', 'disabledSize');
		initI18nOrSize('globalI18n', 'disabledI18n');
	}
});

//Unread count of message center
import { messageCenterStore } from '/@/stores/messageCenter';
const messageCenter = messageCenterStore();
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	&-link {
		height: 100%;
		display: flex;
		align-items: center;
		white-space: nowrap;
		&-photo {
			width: 25px;
			height: 25px;
			border-radius: 100%;
		}
	}
	&-icon {
		padding: 0 10px;
		cursor: pointer;
		color: var(--next-bg-topBarColor);
		height: 50px;
		line-height: 50px;
		display: flex;
		align-items: center;
		&:hover {
			background: var(--next-color-user-hover);
			i {
				display: inline-block;
				animation: logoAnimation 0.3s ease-in-out;
			}
		}
	}
	:deep(.el-dropdown) {
		color: var(--next-bg-topBarColor);
	}
	:deep(.el-badge) {
		height: 40px;
		line-height: 40px;
		display: flex;
		align-items: center;
	}
	:deep(.el-badge__content.is-fixed) {
		top: 12px;
	}
  .online-status{
    cursor: pointer;
    :deep(.el-badge__content.is-fixed) {
      top: 30px;
      font-size: 14px;
      left: 5px;
      height: 12px;
      width: 12px;
      padding: 0;
      background-color: #18bc9c;
    }
  }
  .online-down{
    cursor: pointer;
    :deep(.el-badge__content.is-fixed) {
      top: 30px;
      font-size: 14px;
      left: 5px;
      height: 12px;
      width: 12px;
      padding: 0;
      background-color: #979b9c;
    }
  }
}
</style>
