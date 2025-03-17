<template>
	<div class="columns-form-com">
		<el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px">
			<el-form-item label="Field name" prop="field_name">
				<el-input v-model="formData.field_name" placeholder="Please enter a field name" />
			</el-form-item>

			<el-form-item label="List name" prop="title">
				<el-input v-model="formData.title" placeholder="Please enter the column name" />
			</el-form-item>

			<el-form-item label="Create a display">
				<el-switch v-model="formData.is_create" />
			</el-form-item>

			<el-form-item label="Edit display">
				<el-switch v-model="formData.is_update" />
			</el-form-item>

			<el-form-item label="Query display">
				<el-switch v-model="formData.is_query" />
			</el-form-item>

			<el-form-item>
				<el-button type="primary" @click="handleSubmit" :loading="btnLoading"> Sure </el-button>
				<el-button @click="handleClose">Cancel</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import { addColumnsData, updateColumnsData } from '../ColumnsTableCom/api';
import { successNotification } from '/@/utils/message';
import { CurrentInfoType, ColumnsFormDataType } from '../../types';
import type { FormInstance } from 'element-plus';

const props = defineProps({
	currentInfo: {
		type: Object as () => CurrentInfoType,
		required: true,
		default: () => {},
	},
	initFormData: {
		type: Object as () => Partial<ColumnsFormDataType>,
		default: () => {},
	},
});
const emit = defineEmits(['drawerClose']);

const formRef = ref<FormInstance>();
const formRules = reactive({
	field_name: [{ required: true, message: 'Please enter a field name！', trigger: 'blur' }],
	title: [{ required: true, message: 'Please enter the column name！', trigger: 'blur' }],
});

let formData = reactive<ColumnsFormDataType>({
	field_name: '',
	title: '',
	is_create: true,
	is_update: true,
	is_query: true,
});
let btnLoading = ref(false);

const setMenuFormData = () => {
	if (props.initFormData?.id) {
		formData.id = props.initFormData?.id || '';
		formData.field_name = props.initFormData.field_name || '';
		formData.title = props.initFormData.title || '';
		formData.is_create = !!props.initFormData.is_create;
		formData.is_update = !!props.initFormData.is_update;
		formData.is_query = !!props.initFormData.is_query;
	}
};

const handleSubmit = () => {
	formRef.value?.validate(async (valid) => {
		if (!valid) return;
		try {
			btnLoading.value = true;
			let res;
			if (formData.id) {
				res = await updateColumnsData({ ...formData, ...props.currentInfo });
			} else {
				res = await addColumnsData({ ...formData, ...props.currentInfo });
			}
			if (res?.code === 2000) {
				successNotification(res.msg as string);
				handleClose('submit');
			}
		} finally {
			btnLoading.value = false;
		}
	});
};

const handleClose = (type: string = '') => {
	emit('drawerClose', type);
	formRef.value?.resetFields();
};

onMounted(() => {
	setMenuFormData();
});
</script>

<style lang="scss" scoped>
.columns-form-com {
	height: 100%;
	padding: 20px;
	box-sizing: border-box;
}
</style>
