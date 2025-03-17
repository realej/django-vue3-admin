<template>
	<i v-if="isShowIconSvg" class="el-icon" :style="setIconSvgStyle">
		<component :is="getIconName" />
	</i>
	<div v-else-if="isShowIconImg" :style="setIconImgOutStyle">
		<img :src="getIconName" :style="setIconSvgInsStyle" />
	</div>
	<i v-else :class="getIconName" :style="setIconSvgStyle" />
</template>

<script setup lang="ts" name="svgIcon">
import { computed } from 'vue';

// Define the value passed by the parent component
const props = defineProps({
	// svg Icon component name
	name: {
		type: String,
	},
	// svg size
	size: {
		type: Number,
		default: () => 14,
	},
	// svg color
	color: {
		type: String,
	},
});

// Online links、Locally introduced address prefix
// https://gitee.com/lyt-top/vue-next-admin/issues/I62OVL
const linesString = ['https', 'http', '/src', '/assets', 'data:image', import.meta.env.VITE_PUBLIC_PATH];

// Get icon Icon Name
const getIconName = computed(() => {
	return props?.name;
});
// Used to judge element plus Bring your own svg Display of icons、hide
const isShowIconSvg = computed(() => {
	return props?.name?.startsWith('ele-');
});
// Used to judge online links、Local introduction and other icon display、hide
const isShowIconImg = computed(() => {
	return linesString.find((str) => props.name?.startsWith(str));
});
// Set icon style
const setIconSvgStyle = computed(() => {
	return `font-size: ${props.size}px;color: ${props.color};`;
});
// Set picture style
const setIconImgOutStyle = computed(() => {
	return `width: ${props.size}px;height: ${props.size}px;display: inline-block;overflow: hidden;`;
});
// Set picture style
// https://gitee.com/lyt-top/vue-next-admin/issues/I59ND0
const setIconSvgInsStyle = computed(() => {
	const filterStyle: string[] = [];
	const compatibles: string[] = ['-webkit', '-ms', '-o', '-moz'];
	compatibles.forEach((j) => filterStyle.push(`${j}-filter: drop-shadow(${props.color} 30px 0);`));
	return `width: ${props.size}px;height: ${props.size}px;position: relative;left: -${props.size}px;${filterStyle.join('')}`;
});
</script>
