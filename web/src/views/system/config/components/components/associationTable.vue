<template>
	<div>
		<el-form :model="formObj" ref="associationRef">
			<el-form-item label="Related table" prop="table" :rules="[{ required: true, message: 'Required', trigger: 'blur' }]">
				<el-select v-model="formObj.table" filterable clearable placeholder="Please select" @change="handleChange">
					<el-option v-for="item in tableOptions" :key="item.table" :label="item.tableName" :value="item.table">
						<span style="float: left">{{ item.tableName }}</span>
						<span style="float: right; color: #8492a6; font-size: 13px">{{ item.table }}</span>
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="Show fields" prop="field" :rules="[{ required: true, message: 'Required', trigger: 'blur' }]">
				<el-select v-model="formObj.field" filterable clearable placeholder="Please select">
					<el-option v-for="item in labelOptions" :key="item.table" :label="item.title" :value="item.field">
						<span style="float: left">{{ item.field }}</span>
						<span style="float: right; color: #8492a6; font-size: 13px">{{ item.title }}</span>
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="Save fields" prop="primarykey" :rules="[{ required: true, message: 'Required', trigger: 'blur' }]">
				<el-select v-model="formObj.primarykey" filterable clearable placeholder="Please select">
					<el-option v-for="(item, index) in labelOptions" :key="index" :label="item.title" :value="item.field">
						<span style="float: left">{{ item.field }}</span>
						<span style="float: right; color: #8492a6; font-size: 13px">{{ item.title }}</span>
					</el-option>
				</el-select>
			</el-form-item>
			<el-form-item label="Filter conditions" prop="oldSearchField" :rules="[{ required: true, message: 'Required', trigger: 'blur' }]">
				<el-select v-model="formObj.oldSearchField" multiple filterable clearable placeholder="Please select" @change="handleSearch">
					<el-option v-for="(item, index) in labelOptions" :key="index" :label="item.title" :value="item.field">
						<span style="float: left">{{ item.field }}</span>
						<span style="float: right; color: #8492a6; font-size: 13px">{{ item.title }}</span>
					</el-option>
				</el-select>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang="ts">
import * as api from '../../api';
import { ref, reactive, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { successMessage } from '/@/utils/message';
let formObj: any = reactive({
	table: null,
	primarykey: null,
	field: null,
	searchField: null,
	oldSearchField: null,
});
let searchField = ref('');
let tableOptions: any = ref([]);
let labelOptions: any = ref([]);
const associationRef: any = ref<FormInstance>();

const emits = defineEmits(['updateVal']);
const props = defineProps(['value']);
// Initialize data
const init = () => {
	api.GetAssociationTable().then((res: any) => {
		const { data } = res.data;
		tableOptions = data;
		// Set default selected
		formObj.table = data[0].table;
		labelOptions = data[0].tableFields;
		formObj.primarykey = 'id';
		formObj.field = 'id';
	});
};
// Select Event
const handleChange = (val: any) => {
	const { tableFields } = tableOptions.find((item: any) => {
		return item.table === val;
	});
	labelOptions = tableFields;
};

// Select filter conditions
const handleSearch = (val: any) => {
	const fields = labelOptions.filter((item: any) => {
		return val.indexOf(item.field) > -1;
	});
	formObj.searchField = fields;
};
// Update data
const handleUpdate = () => {
	emits('updateVal', formObj);
};
// Data Verification
const onSubmit = () => {
	let res = false;
	associationRef.value.validate((valid: any) => {
		if (valid) {
			res = true;
		} else {
			return false;
		}
	});
	return res;
};
</script>

<style></style>
