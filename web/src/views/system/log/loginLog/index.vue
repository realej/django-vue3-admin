<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
	</fs-page>
</template>

<script lang="ts" setup name="loginLog">
import { onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { GetPermission } from './api';
import { handleColumnPermission } from '/@/utils/columnPermission';

const { crudBinding, crudRef, crudExpose, crudOptions, resetCrudOptions } = useFs({ createCrudOptions });

// Get list data after the page is opened
onMounted(async () => {
	// Set column permissions
	const newOptions = await handleColumnPermission(GetPermission, crudOptions);
	//ResetcrudBinding
	resetCrudOptions(newOptions);
	// refresh
	crudExpose.doRefresh();
});
</script>
