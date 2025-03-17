<template>
	<div class="editor-container">
		<Toolbar :editor="editorRef" :mode="mode" />
		<Editor
			:mode="mode"
			:defaultConfig="state.editorConfig"
			:style="{ height }"
			v-model="state.editorVal"
			@onCreated="handleCreated"
			@onChange="handleChange"
		/>
	</div>
</template>

<script setup lang="ts" name="wngEditor">
// https://www.wangeditor.com/v5/for-frame.html#vue3
import '@wangeditor/editor/dist/css/style.css';
import { reactive, shallowRef, watch, onBeforeUnmount } from 'vue';
import { IDomEditor } from '@wangeditor/editor';
import { Toolbar, Editor } from '@wangeditor/editor-for-vue';

// Define the value passed by the parent component
const props = defineProps({
	// Whether to disable
	disable: {
		type: Boolean,
		default: () => false,
	},
	// Content box default placeholder
	placeholder: {
		type: String,
		default: () => 'Please enter content...',
	},
	// https://www.wangeditor.com/v5/getting-started.html#mode-%E6%A8%A1%E5%BC%8F
	// model，Optional <default|simple>，default default
	mode: {
		type: String,
		default: () => 'default',
	},
	// high
	height: {
		type: String,
		default: () => '310px',
	},
	// Two-way binding，Used to obtain editor.getHtml()
	getHtml: String,
	// Two-way binding，Used to obtain editor.getText()
	getText: String,
});

// Define child components to pass values ​​to parent components/event
const emit = defineEmits(['update:getHtml', 'update:getText']);

// Define variable content
const editorRef = shallowRef();
const state = reactive({
	editorConfig: {
		placeholder: props.placeholder,
	},
	editorVal: props.getHtml,
});

// Editor callback function
const handleCreated = (editor: IDomEditor) => {
	editorRef.value = editor;
};
// When the editor content changes
const handleChange = (editor: IDomEditor) => {
	emit('update:getHtml', editor.getHtml());
	emit('update:getText', editor.getText());
};
// When the page is destroyed
onBeforeUnmount(() => {
	const editor = editorRef.value;
	if (editor == null) return;
	editor.destroy();
});
// Listen to whether to disable changes
// https://gitee.com/lyt-top/vue-next-admin/issues/I4LM7I
watch(
	() => props.disable,
	(bool) => {
		const editor = editorRef.value;
		if (editor == null) return;
		bool ? editor.disable() : editor.enable();
	},
	{
		deep: true,
	}
);
// Listen to the change of two-way binding value，For echo
watch(
	() => props.getHtml,
	(val) => {
		state.editorVal = val;
	},
	{
		deep: true,
	}
);
</script>
