<template>
	<transition name="el-zoom-in-center">
		<div
			aria-hidden="true"
			class="el-dropdown__popper el-popper is-light is-pure custom-contextmenu"
			role="tooltip"
			data-popper-placement="bottom"
			:style="`top: ${dropdowns.y + 5}px;left: ${dropdowns.x}px;`"
			:key="Math.random()"
			v-show="state.isShow"
		>
			<ul class="el-dropdown-menu">
				<template v-for="(v, k) in state.dropdownList">
					<li
						class="el-dropdown-menu__item"
						aria-disabled="false"
						tabindex="-1"
						:key="k"
						v-if="!v.affix"
						@click="onCurrentContextmenuClick(v.contextMenuClickId)"
					>
						<SvgIcon :name="v.icon" />
						<span>{{ $t(v.txt) }}</span>
					</li>
				</template>
			</ul>
			<div class="el-popper__arrow" :style="{ left: `${state.arrowLeft}px` }"></div>
		</div>
	</transition>
</template>

<script setup lang="ts" name="layoutTagsViewContextmenu">
import { computed, reactive, onMounted, onUnmounted, watch } from 'vue';

// Define the value passed by the parent component
const props = defineProps({
	dropdown: {
		type: Object,
		default: () => {
			return {
				x: 0,
				y: 0,
			};
		},
	},
});

// Define child components to pass values ​​to parent components/event
const emit = defineEmits(['currentContextmenuClick']);

// Define variable content
const state = reactive({
	isShow: false,
	dropdownList: [
		{ contextMenuClickId: 0, txt: 'message.tagsView.refresh', affix: false, icon: 'ele-RefreshRight' },
		{ contextMenuClickId: 1, txt: 'message.tagsView.close', affix: false, icon: 'ele-Close' },
		{ contextMenuClickId: 2, txt: 'message.tagsView.closeOther', affix: false, icon: 'ele-CircleClose' },
		{ contextMenuClickId: 3, txt: 'message.tagsView.closeAll', affix: false, icon: 'ele-FolderDelete' },
		{
			contextMenuClickId: 4,
			txt: 'message.tagsView.fullscreen',
			affix: false,
			icon: 'iconfont icon-fullscreen',
		},
	],
	item: {},
	arrowLeft: 10,
});

// The coordinates passed by the parent x,y value
const dropdowns = computed(() => {
	// 117 for `Dropdown Pull-down menu` Width of
	if (props.dropdown.x + 117 > document.documentElement.clientWidth) {
		return {
			x: document.documentElement.clientWidth - 117 - 5,
			y: props.dropdown.y,
		};
	} else {
		return props.dropdown;
	}
});
// Click the current item menu
const onCurrentContextmenuClick = (contextMenuClickId: number) => {
	emit('currentContextmenuClick', Object.assign({}, { contextMenuClickId }, state.item));
};
// Open the right-click menu：Determine whether it is fixed，If the close button is fixed, it will not be displayed.
const openContextmenu = (item: RouteItem) => {
	state.item = item;
	item.meta?.isAffix ? (state.dropdownList[1].affix = true) : (state.dropdownList[1].affix = false);
	closeContextmenu();
	setTimeout(() => {
		state.isShow = true;
	}, 10);
};
// Close the right-click menu
const closeContextmenu = () => {
	state.isShow = false;
};
// Listen to the monitor page and close the right-click menu
onMounted(() => {
	document.body.addEventListener('click', closeContextmenu);
});
// When the page is uninstalled，Remove the right-click menu listening event
onUnmounted(() => {
	document.body.removeEventListener('click', closeContextmenu);
});
// Listen to drop-down menu location
watch(
	() => props.dropdown,
	({ x }) => {
		if (x + 117 > document.documentElement.clientWidth) state.arrowLeft = 117 - (document.documentElement.clientWidth - x);
		else state.arrowLeft = 10;
	},
	{
		deep: true,
	}
);

// Expose variables
defineExpose({
	openContextmenu,
});
</script>

<style scoped lang="scss">
.custom-contextmenu {
	transform-origin: center top;
	z-index: 2190;
	position: fixed;
	.el-dropdown-menu__item {
		font-size: 12px !important;
		white-space: nowrap;
		i {
			font-size: 12px !important;
		}
	}
}
</style>
