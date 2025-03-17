<template>
	<div class="icon-selector w100 h100">
		<el-input
			v-model="state.fontIconSearch"
			:placeholder="state.fontIconPlaceholder"
			:clearable="clearable"
			:disabled="disabled"
			:size="size"
			ref="inputWidthRef"
			@clear="onClearFontIcon"
			@focus="onIconFocus"
			@blur="onIconBlur"
		>
			<template #prepend>
				<SvgIcon
					:name="state.fontIconPrefix === '' ? prepend : state.fontIconPrefix"
					class="font14"
					v-if="state.fontIconPrefix === '' ? prepend?.indexOf('ele-') > -1 : state.fontIconPrefix?.indexOf('ele-') > -1"
				/>
				<i v-else :class="state.fontIconPrefix === '' ? prepend : state.fontIconPrefix" class="font14"></i>
			</template>
		</el-input>
		<el-popover
			placement="bottom"
			:width="state.fontIconWidth"
			transition="el-zoom-in-top"
			popper-class="icon-selector-popper"
			trigger="click"
			:virtual-ref="inputWidthRef"
			virtual-triggering
		>
			<template #default>
				<div class="icon-selector-warp">
					<div class="icon-selector-warp-title">{{ title }}</div>
					<el-tabs v-model="state.fontIconTabActive" @tab-click="onIconClick">
						<el-tab-pane lazy label="ali" name="ali">
							<IconList :list="fontIconSheetsFilterList" :empty="emptyDescription" :prefix="state.fontIconPrefix" @get-icon="onColClick" />
						</el-tab-pane>
						<el-tab-pane lazy label="ele" name="ele">
							<IconList :list="fontIconSheetsFilterList" :empty="emptyDescription" :prefix="state.fontIconPrefix" @get-icon="onColClick" />
						</el-tab-pane>
						<el-tab-pane lazy label="awe" name="awe">
							<IconList :list="fontIconSheetsFilterList" :empty="emptyDescription" :prefix="state.fontIconPrefix" @get-icon="onColClick" />
						</el-tab-pane>
					</el-tabs>
				</div>
			</template>
		</el-popover>
	</div>
</template>

<script setup lang="ts" name="iconSelector">
import { defineAsyncComponent, ref, reactive, onMounted, nextTick, computed, watch } from 'vue';
import type { TabsPaneContext } from 'element-plus';
import initIconfont from '/@/utils/getStyleSheets';
import '/@/theme/iconSelector.scss';

// Define the value passed by the parent component
const props = defineProps({
	// Input box prefix
	prepend: {
		type: String,
		default: () => 'ele-Pointer',
	},
	// Input box placeholder text
	placeholder: {
		type: String,
		default: () => 'Please enter content to search icon or select the icon',
	},
	// Input box placeholder text
	size: {
		type: String,
		default: () => 'default',
	},
	// Pop-up title
	title: {
		type: String,
		default: () => 'Please select the icon',
	},
	// Disabled
	disabled: {
		type: Boolean,
		default: () => false,
	},
	// Is it emptiable?
	clearable: {
		type: Boolean,
		default: () => true,
	},
	// Customize empty status description text
	emptyDescription: {
		type: String,
		default: () => 'No related icons',
	},
	// Bidirectional binding value，Default is modelValue，
	// reference：https://v3.cn.vuejs.org/guide/migration/v-model.html#%E8%BF%81%E7%A7%BB%E7%AD%96%E7%95%A5
	// reference：https://v3.cn.vuejs.org/guide/component-custom-events.html#%E5%A4%9A%E4%B8%AA-v-model-%E7%BB%91%E5%AE%9A
	modelValue: String,
});

// Define child components to pass values ​​to parent components/event
const emit = defineEmits(['update:modelValue', 'get', 'clear']);

// Introducing components
const IconList = defineAsyncComponent(() => import('/@/components/iconSelector/list.vue'));

// Define variable content
const inputWidthRef = ref();
const state = reactive({
	fontIconPrefix: '',
	fontIconWidth: 0,
	fontIconSearch: '',
	fontIconPlaceholder: '',
	fontIconTabActive: 'ali',
	fontIconList: {
		ali: [],
		ele: [],
		awe: [],
	},
});

// deal with input When getting focus，modelValue When there is a value，Change input of placeholder value
const onIconFocus = () => {
	if (!props.modelValue) return false;
	state.fontIconSearch = '';
	state.fontIconPlaceholder = props.modelValue;
};
// deal with input When the focus is lost，Empty will clear input value，When the icon is selected for clicking，Will take the original value
const onIconBlur = () => {
	const list = fontIconTabNameList();
	setTimeout(() => {
		const icon = list.filter((icon: string) => icon === state.fontIconSearch);
		if (icon.length <= 0) state.fontIconSearch = '';
	}, 300);
};
// Icon search and icon data display
const fontIconSheetsFilterList = computed(() => {
	const list = fontIconTabNameList();
	if (!state.fontIconSearch) return list;
	let search = state.fontIconSearch.trim().toLowerCase();
	return list.filter((item: string) => {
		if (item.toLowerCase().indexOf(search) !== -1) return item;
	});
});
// according to tab name Type Settings Icon
const fontIconTabNameList = () => {
	let iconList: any = [];
	if (state.fontIconTabActive === 'ali') iconList = state.fontIconList.ali;
	else if (state.fontIconTabActive === 'ele') iconList = state.fontIconList.ele;
	else if (state.fontIconTabActive === 'awe') iconList = state.fontIconList.awe;
	return iconList;
};
// deal with icon Bidirectional binding numerical echo
const initModeValueEcho = () => {
	if (props.modelValue === '') return ((<string | undefined>state.fontIconPlaceholder) = props.placeholder);
	(<string | undefined>state.fontIconPlaceholder) = props.modelValue;
	(<string | undefined>state.fontIconPrefix) = props.modelValue;
};
// deal with icon type，Used for echo time，tab Highlight and initialize data
const initFontIconName = () => {
	let name = 'ali';
	if (props.modelValue!.indexOf('iconfont') > -1) name = 'ali';
	else if (props.modelValue!.indexOf('ele-') > -1) name = 'ele';
	else if (props.modelValue!.indexOf('fa') > -1) name = 'awe';
	// initialization tab Highlight echo
	state.fontIconTabActive = name;
	return name;
};
// Initialize data
const initFontIconData = async (name: string) => {
	if (name === 'ali') {
		// Use Alibaba font icon `iconfont xxx`
		if (state.fontIconList.ali.length > 0) return;
		await initIconfont.ali().then((res: any) => {
			state.fontIconList.ali = res.map((i: string) => `iconfont ${i}`);
		});
	} else if (name === 'ele') {
		// element plus icon
		if (state.fontIconList.ele.length > 0) return;
		await initIconfont.ele().then((res: any) => {
			state.fontIconList.ele = res;
		});
	} else if (name === 'awe') {
		// fontawesomeFont icon use `fa xxx`
		if (state.fontIconList.awe.length > 0) return;
		await initIconfont.awe().then((res: any) => {
			state.fontIconList.awe = res.map((i: string) => `fa ${i}`);
		});
	}
	// initialization input of placeholder
	// reference（Single data flow）：https://cn.vuejs.org/v2/guide/components-props.html?#%E5%8D%95%E5%90%91%E6%95%B0%E6%8D%AE%E6%B5%81
	state.fontIconPlaceholder = props.placeholder;
	// Initialize bidirectional binding echo
	initModeValueEcho();
};
// Click to switch icon
const onIconClick = (pane: TabsPaneContext) => {
	initFontIconData(pane.paneName as string);
	inputWidthRef.value.focus();
};
// Get the currently clicked icon icon
const onColClick = (v: string) => {
	state.fontIconPlaceholder = v;
	state.fontIconPrefix = v;
	emit('get', state.fontIconPrefix);
	emit('update:modelValue', state.fontIconPrefix);
	inputWidthRef.value.focus();
};
// Clear the currently clicked icon icon
const onClearFontIcon = () => {
	state.fontIconPrefix = '';
	emit('clear', state.fontIconPrefix);
	emit('update:modelValue', state.fontIconPrefix);
};
// Get input Width of
const getInputWidth = () => {
	nextTick(() => {
		state.fontIconWidth = inputWidthRef.value.$el.offsetWidth;
	});
};
// Listen to page width changes
const initResize = () => {
	window.addEventListener('resize', () => {
		getInputWidth();
	});
};
// When the page loads
onMounted(() => {
	initFontIconData(initFontIconName());
	initResize();
	getInputWidth();
});
// Listening two-way binding modelValue Changes
watch(
	() => props.modelValue,
	() => {
		initModeValueEcho();
		initFontIconName();
	}
);
</script>
