<template>
	<el-drawer size="70%" v-model="drawer" direction="rtl" destroy-on-close :before-close="handleClose">
    <fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
	</el-drawer>
</template>

<script lang="ts" setup>
import { ref, onMounted, defineAsyncComponent } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { useExpose, useCrud } from '@fast-crud/fast-crud';
import { ElMessageBox } from 'element-plus';

//Is the drawer displayed?
const drawer = ref(false);

//Drawer closing confirmation
const handleClose = (done: () => void) => {
	ElMessageBox.confirm('You are sure to close?', {
		confirmButtonText: 'Sure',
		cancelButtonText: 'Cancel',
		type: 'warning',
	})
		.then(() => {
			done();
		})
		.catch(() => {
			// catch error
		});
};

const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions, context: {} });
const { setSearchFormData, doRefresh } = crudExpose;

defineExpose({ drawer, setSearchFormData, doRefresh });
// Get list data after the page is opened
onMounted(() => {
	crudExpose.doRefresh();
});
</script>
