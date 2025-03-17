<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding">
			<template #header-middle>
				<el-tabs v-model="tabActivted" @tab-click="onTabClick">
					<el-tab-pane label="My release" name="send"></el-tab-pane>
					<el-tab-pane label="My Received" name="receive"></el-tab-pane>
				</el-tabs>
			</template>
		</fs-crud>
	</fs-page>
</template>

<script lang="ts" setup name="messageCenter">
import { ref, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import createCrudOptions from './crud';

//tabchoose
const tabActivted = ref('send');
const onTabClick = (tab: any) => {
	const { paneName } = tab;
	tabActivted.value = paneName;
	crudExpose.doRefresh();
};

const context: any = { tabActivted }; //Will tabActivted passcontextPass tocrud.tsx
// initializationcrudConfiguration
const { crudRef, crudBinding, crudExpose } = useFs({ createCrudOptions, context });

// Get list data after the page is opened
onMounted(() => {
	crudExpose.doRefresh();
});
</script>
