<template>
	<div class="menu-form-com">
		<div class="menu-form-alert">
			1.Red asterisk means required;<br />
			2.Add menu，If it's a directory，The component address is empty;<br />
			3.Add root node menu，The parent menu is empty;
		</div>
		<el-form ref="formRef" :rules="rules" :model="menuFormData" label-width="80px" label-position="right">
			<el-form-item label="Menu name" prop="name">
				<el-input v-model="menuFormData.name" placeholder="Please enter the menu name" />
			</el-form-item>
			<el-form-item label="Parent menu" prop="parent">
				<el-tree-select v-model="menuFormData.parent" :props="defaultTreeProps" :data="deptDefaultList"
					:cache-data="props.cacheData" lazy check-strictly clearable :load="handleTreeLoad"
					placeholder="Please select the parent menu" style="width: 100%" />
			</el-form-item>

			<el-form-item label="Routing address" prop="web_path">
				<el-input v-model="menuFormData.web_path" placeholder="Please enter the routing address，Please/beginning" />
			</el-form-item>

			<el-form-item label="icon" prop="icon">
				<IconSelector clearable v-model="menuFormData.icon" />
			</el-form-item>

			<el-row>
				<el-col :span="12">
					<el-form-item required label="state">
						<el-switch v-model="menuFormData.status" width="60" inline-prompt active-text="Enable"
							inactive-text="Disabled" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item v-if="menuFormData.status" required label="Side display">
						<el-switch v-model="menuFormData.visible" width="60" inline-prompt active-text="show"
							inactive-text="hide" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row>
				<el-col :span="12">
					<el-form-item required label="Whether to directory">
						<el-switch v-model="menuFormData.is_catalog" width="60" inline-prompt active-text="yes"
							inactive-text="no" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item v-if="!menuFormData.is_catalog" required label="External link">
						<el-switch v-model="menuFormData.is_link" width="60" inline-prompt active-text="yes"
							inactive-text="no" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item required v-if="!menuFormData.is_catalog" label="Is it fixed or not">
						<el-switch v-model="menuFormData.is_affix" width="60" inline-prompt active-text="yes"
							inactive-text="no" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item v-if="!menuFormData.is_catalog && menuFormData.is_link" required label="Is it embedded?">
						<el-switch v-model="menuFormData.is_iframe" width="60" inline-prompt active-text="yes"
							inactive-text="no" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-form-item label="Remark">
				<el-input v-model="menuFormData.description" maxlength="200" show-word-limit type="textarea"
					placeholder="Please enter a note" />
			</el-form-item>

			<el-divider></el-divider>

			<div style="min-height: 184px">
				<el-form-item v-if="!menuFormData.is_catalog && !menuFormData.is_link" label="Component address" prop="component">
					<el-autocomplete class="w-full" v-model="menuFormData.component" :fetch-suggestions="querySearch"
						:trigger-on-focus="false" clearable :debounce="100" placeholder="Enter component address" />
				</el-form-item>

				<el-form-item v-if="!menuFormData.is_catalog && !menuFormData.is_link" label="Component name"
					prop="component_name">
					<el-input v-model="menuFormData.component_name" placeholder="Please enter the component name" />
				</el-form-item>

				<el-form-item v-if="!menuFormData.is_catalog && menuFormData.is_link" label="External link" prop="link_url">
					<el-input v-model="menuFormData.link_url" placeholder="Please enter the external link address" />
          <el-alert :title="`enter{{token}}Automatically replace the system token `" type="info" />
				</el-form-item>

				<el-form-item v-if="!menuFormData.is_catalog" label="cache">
					<el-switch v-model="menuFormData.cache" width="60" inline-prompt active-text="Enable"
						inactive-text="Disabled" />
				</el-form-item>
			</div>

			<el-divider></el-divider>
		</el-form>

		<div class="menu-form-btns">
			<el-button @click="handleSubmit" type="primary" :loading="menuBtnLoading">keep</el-button>
			<el-button @click="handleCancel">Cancel</el-button>
		</div>
	</div>
</template>

<script lang="ts" setup>
import XEUtils from 'xe-utils';
import { ref, onMounted, reactive } from 'vue';
import { ElForm, FormRules } from 'element-plus';
import IconSelector from '/@/components/iconSelector/index.vue';
import { lazyLoadMenu, AddObj, UpdateObj } from '../../api';
import { successNotification } from '/@/utils/message';
import { MenuFormDataType, MenuTreeItemType, ComponentFileItem, APIResponseData } from '../../types';
import type Node from 'element-plus/es/components/tree/src/model/node';

interface IProps {
	initFormData: Partial<MenuTreeItemType> | null;
	treeData: MenuTreeItemType[];
	cacheData: MenuTreeItemType[];
}

const defaultTreeProps: any = {
	children: 'children',
	label: 'name',
	value: 'id',
	isLeaf: (data: MenuTreeItemType[], node: Node) => {
		if (node?.data.hasChild) {
			return false;
		} else {
			return true;
		}
	},
};
const validateWebPath = (rule: any, value: string, callback: Function) => {
	let pattern = /^\/.*?/;
	const reg = pattern.test(value);
	if (reg) {
		callback();
	} else {
		callback(new Error('Please enter the correct address'));
	}
};

const validateLinkUrl = (rule: any, value: string, callback: Function) => {
	let pattern = /^\/.*?/;
	let patternUrl = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
	const reg = pattern.test(value) || patternUrl.test(value)
	if (reg) {
		callback();
	} else {
		callback(new Error('Please enter the correct address'));
	}
};

const props = withDefaults(defineProps<IProps>(), {
	initFormData: () => null,
	treeData: () => [],
	cacheData: () => [],
});
const emit = defineEmits(['drawerClose']);

const formRef = ref<InstanceType<typeof ElForm>>();

const rules = reactive<FormRules>({
	web_path: [{ required: true, message: 'Please enter the correct address', validator: validateWebPath, trigger: 'blur' }],
	name: [{ required: true, message: 'Menu name required', trigger: 'blur' }],
	component: [{ required: true, message: 'Please enter the component address', trigger: 'blur' }],
	component_name: [{ required: true, message: 'Please enter the component name', trigger: 'blur' }],
	link_url: [{ required: true, message: 'Please enter the external link address', validator: validateLinkUrl, trigger: 'blur' }],
});

let deptDefaultList = ref<MenuTreeItemType[]>([]);
let menuFormData = reactive<MenuFormDataType>({
	parent: '',
	name: '',
	component: '',
	web_path: '',
	icon: '',
	cache: true,
	status: true,
	visible: true,
	component_name: '',
	description: '',
	is_catalog: false,
	is_link: false,
	is_iframe: false,
	is_affix: false,
	link_url: ''
});
let menuBtnLoading = ref(false);

const setMenuFormData = () => {
	if (props.initFormData?.id) {
		menuFormData.id = props.initFormData?.id || '';
		menuFormData.name = props.initFormData?.name || '';
		menuFormData.parent = props.initFormData?.parent || '';
		menuFormData.component = props.initFormData?.component || '';
		menuFormData.web_path = props.initFormData?.web_path || '';
		menuFormData.icon = props.initFormData?.icon || '';
		menuFormData.status = !!props.initFormData.status;
		menuFormData.visible = !!props.initFormData.visible;
		menuFormData.cache = !!props.initFormData.cache;
		menuFormData.component_name = props.initFormData?.component_name || '';
		menuFormData.description = props.initFormData?.description || '';
		menuFormData.is_catalog = !!props.initFormData.is_catalog;
		menuFormData.is_link = !!props.initFormData.is_link;
		menuFormData.is_iframe = !!props.initFormData.is_iframe;
		menuFormData.is_affix = !!props.initFormData.is_affix;
		menuFormData.link_url = props.initFormData.link_url;
	}
};

const querySearch = (queryString: string, cb: any) => {
	const files: any = import.meta.glob('@views/**/*.vue');
	let fileLists: Array<any> = [];
	Object.keys(files).forEach((queryString: string) => {
		fileLists.push({
			label: queryString.replace(/(\.\/|\.vue)/g, ''),
			value: queryString.replace(/(\.\/|\.vue)/g, ''),
		});
	});
	const results = queryString ? fileLists.filter(createFilter(queryString)) : fileLists;
	// Remove it uniformly/src/views/Prefix
	results.forEach((val) => {
		val.label = val.label.replace('/src/views/', '');
		val.value = val.value.replace('/src/views/', '');
	});
	cb(results);
};

const createFilter = (queryString: string) => {
	return (file: ComponentFileItem) => {
		return file.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1;
	};
};

/**
 * Lazy loading of the tree
 */
const handleTreeLoad = (node: Node, resolve: Function) => {
	if (node.level !== 0) {
		lazyLoadMenu({ parent: node.data.id }).then((res: APIResponseData) => {
			resolve(XEUtils.filter(res.data, (i: MenuTreeItemType) => i.is_catalog));
		});
	}
};

const handleSubmit = () => {
	if (!formRef.value) return;
	formRef.value.validate(async (valid) => {
		if (!valid) return;
		try {
			let res;
			menuBtnLoading.value = true;
			if (menuFormData.id) {
				res = await UpdateObj(menuFormData);
			} else {
				res = await AddObj(menuFormData);
			}
			if (res?.code === 2000) {
				successNotification(res.msg as string);
				handleCancel('submit');
			}
		} finally {
			menuBtnLoading.value = false;
		}
	});
};

const handleCancel = (type: string = '') => {
	emit('drawerClose', type);
	formRef.value?.resetFields();
};

/**
 * initialization
 */
onMounted(async () => {
	props.treeData.map((item) => {
		if (item.is_catalog) {
			deptDefaultList.value.push(item);
		}
	});
	setMenuFormData();
});
</script>

<style lang="scss" scoped>
.menu-form-com {
	margin: 10px;
	overflow-y: auto;

	.menu-form-alert {
		color: #fff;
		line-height: 24px;
		padding: 8px 16px;
		margin-bottom: 20px;
		border-radius: 4px;
		background-color: var(--el-color-primary);
	}

	.menu-form-btns {
		padding-bottom: 10px;
		box-sizing: border-box;
	}
}
</style>
