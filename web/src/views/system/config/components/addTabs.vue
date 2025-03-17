<template>
	<div style="padding: 20px">
		<el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
			<el-form-item label="title" prop="title">
				<el-input v-model="form.title"></el-input>
			</el-form-item>
			<el-form-item label="keyvalue" prop="key">
				<el-input v-model="form.key"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onSubmit(formRef)">Create now</el-button>
				<el-button>Cancel</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import * as api from '../api';
import {ref, reactive, inject} from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { successMessage } from '/@/utils/message';

let form = reactive({
	title: null,
	key: null,
});
const formRef = ref<FormInstance>();
const rules = reactive<FormRules>({
	title: [
		{
			required: true,
			message: 'Please enter',
		},
	],
	key: [
		{
			required: true,
			message: 'Please enter',
		},
		{
			pattern: /^[A-Za-z0-9]+$/,
			message: 'Only in English and numbers',
		},
	],
});


const refreshView:any = inject('refreshView')
const onSubmit = async (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	await formEl.validate((valid, fields) => {
		if (valid) {
			api.AddObj(form).then((res: any) => {
				if (res.code == 2000) {
          successMessage('New addition successful');
          refreshView()
        }

			});
		} else {
			console.log('error submit!', fields);
		}
	});
};
</script>

<style></style>
