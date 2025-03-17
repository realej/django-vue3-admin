<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding">
			<template #cell_url="scope">
				<el-tag size="small">{{ scope.row.url }}</el-tag>
			</template>
		</fs-crud>
	</fs-page>
</template>

<script lang="ts" setup name="downloadCenter">
import { ref, onMounted, inject, onBeforeUpdate } from 'vue';

import { GetPermission } from './api';
import { useExpose, useCrud } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import PermissionComNew from './components/PermissionComNew/index.vue';
import _ from "lodash-es";
import { handleColumnPermission } from "/@/utils/columnPermission";

// crudComponentref
const crudRef = ref();
// crud Configuredref
const crudBinding = ref();

const { crudExpose } = useExpose({ crudRef, crudBinding });

// yourcrudConfiguration
const { crudOptions } = createCrudOptions({ crudExpose });

// initializationcrudConfiguration
const { resetCrudOptions } = useCrud({
	crudExpose,
	crudOptions,
	context: {},
});

// Get list data after the page is opened
onMounted(async () => {
	crudExpose.doRefresh();
});
</script>
