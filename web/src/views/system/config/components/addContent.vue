<template>
	<div style="padding: 20px">
		<el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
			<el-form-item label="Grouping" prop="parent">
				<el-select v-model="form.parent" placeholder="Please select Grouping" clearable>
					<el-option :label="item.title" :value="item.id" :key="index" v-for="(item, index) in parentOptions"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="title" prop="title">
				<el-input v-model="form.title" placeholder="Please enter" clearable></el-input>
			</el-form-item>
			<el-form-item label="keyvalue" prop="key">
				<el-input v-model="form.key" placeholder="Please enter" clearable></el-input>
			</el-form-item>
			<el-form-item label="Form Type" prop="form_item_type">
				<el-select v-model="form.form_item_type" placeholder="Please select" clearable>
					<el-option :label="item.label" :value="item.value" :key="index" v-for="(item, index) in dictionary('config_form_type')"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item
				v-if="[4, 5, 6].indexOf(form.form_item_type) > -1"
				label="dictionarykey"
				prop="setting"
				:rules="[{ required: true, message: 'Can't be empty' }]"
			>
				<el-input v-model="form.setting" placeholder="Please enterdictionarymiddlekeyvalue" clearable></el-input>
			</el-form-item>
			<div v-if="[13, 14].indexOf(form.form_item_type) > -1">
				<associationTable ref="associationTableRef" v-model="form.setting" @updateVal="associationTableUpdate"></associationTable>
			</div>
			<el-form-item label="Verification rules">
				<el-select v-model="form.rule" multiple placeholder="Please select(Multiple choices are available)" clearable>
					<el-option :label="item.label" :value="item.value" :key="index" v-for="(item, index) in ruleOptions"></el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="Prompt information" prop="placeholder">
				<el-input v-model="form.placeholder" placeholder="Please enter" clearable></el-input>
			</el-form-item>
			<el-form-item label="Sort" prop="sort">
				<el-input-number v-model="form.sort" :min="0" :max="99"></el-input-number>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="onSubmit(formRef)">Create now</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import * as api from '../api';
import associationTable from './components/associationTable.vue';
import {ref, reactive, onMounted, inject} from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { successMessage } from '/@/utils/message';
import { dictionary } from '/@/utils/dictionary';
let form: any = reactive({
	parent: null,
	title: null,
	key: null,
	form_item_type: '',
	rule: null,
	placeholder: null,
});
const formRef = ref<FormInstance>();
const associationTableRef: any = ref<FormInstance>();
const rules = reactive<FormRules>({
	parent: [
		{
			required: true,
			message: 'Please select',
		},
	],
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
			pattern: /^[A-Za-z0-9_]+$/,
			message: 'Please enter a number、Letter or underline',
		},
	],
	form_item_type: [
		{
			required: true,
			message: 'Please enter',
		},
	],
});
let parentOptions: any = ref([]);
let ruleOptions = ref([
	{
		label: 'Required',
		value: '{"required": true, "message": "Required fields cannot be empty"}',
	},
	{
		label: 'Mail',
		value: '{ "type": "email", "message": "Please enter the correct email address"}',
	},
	{
		label: 'URLaddress',
		value: '{ "type": "url", "message": "Please enter the correct oneURLaddress"}',
	},
]);
const getParent = () => {
	api
		.GetList({
			parent__isnull: true,
			limit: 999,
		})
		.then((res: any) => {
			parentOptions.value = res.data;
		});
};

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

// Related table data update
const associationTableUpdate = () => {
	return new Promise(function (resolve, reject) {
		if (associationTableRef) {
			if (!associationTableRef.onSubmit()) {
				// eslint-disable-next-line prefer-promise-reject-errors
				return reject(false);
			}
			const { formObj } = associationTableRef;
			form.setting = formObj;
			return resolve(true);
		} else {
			return resolve(true);
		}
	});
};

onMounted(() => {
	getParent();
});
</script>

<style></style>
