<template>
	<div class="pccm-item" v-if="RoleMenuField.$state.length > 0">
		<div class="menu-form-alert">
			<el-button size="small" @click="handleSaveField">keep </el-button>
			Configure Data Column Field Permissions
		</div>

		<ul class="columns-list">
			<li class="columns-head">
				<div class="width-txt">
					<span>Fields</span>
				</div>
				<div v-for="(head, hIndex) in RoleMenuFieldHeader.$state" :key="hIndex" class="width-check">
					<el-checkbox v-model="head.checked" @change="handleColumnChange($event, head.value, head.disabled)">
						<span>{{ head.label }}</span>
					</el-checkbox>
				</div>
			</li>
			<div class="columns-content">
				<li v-for="(c_item, c_index) in RoleMenuField.$state" :key="c_index" class="columns-item">
					<div class="width-txt">{{ c_item.title }}</div>
					<div v-for="(col, cIndex) in RoleMenuFieldHeader.$state" :key="cIndex" class="width-check">
						<el-checkbox v-model="c_item[col.value]" class="ci-checkout" :disabled="c_item[col.disabled]"></el-checkbox>
					</div>
				</li>
			</div>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { RoleDrawerStores } from '../stores/RoleDrawerStores';
import { RoleMenuFieldStores, RoleMenuFieldHeaderStores } from '../stores/RoleMenuFieldStores';
import { setRoleMenuField } from './api';
const RoleMenuField = RoleMenuFieldStores();
const RoleMenuFieldHeader = RoleMenuFieldHeaderStores();
const RoleDrawer = RoleDrawerStores(); // Role-drawer
/** Select all */
const handleColumnChange = (val: boolean, btnType: string, disabledType: string) => {
	for (const iterator of RoleMenuField.$state) {
		iterator[btnType] = iterator[disabledType] ? iterator[btnType] : val;
	}
};
const handleSaveField = async () => {
	const res = await setRoleMenuField(RoleDrawer.$state.roleId, RoleMenuField.$state);
	ElMessage({ message: res.msg, type: 'success' });
};
</script>

<style lang="scss" scoped>
.pccm-item {
	margin-bottom: 10px;
	.menu-form-alert {
		color: #fff;
		line-height: 24px;
		padding: 8px 16px;
		margin-bottom: 20px;
		border-radius: 4px;
		background-color: var(--el-color-primary);
	}
	.menu-form-btn {
		margin-left: 10px;
		height: 40px;
		padding: 8px 16px;
		margin-bottom: 20px;
	}

	.btn-item {
		display: flex;
		align-items: center;

		span {
			margin-left: 5px;
		}
	}

	.columns-list {
		.width-txt {
			width: 200px;
		}

		.width-check {
			width: 100px;
		}

		.width-icon {
			cursor: pointer;
		}

		.columns-head {
			display: flex;
			align-items: center;
			padding: 6px 0;
			border-bottom: 1px solid #ebeef5;
			box-sizing: border-box;

			span {
				font-weight: 900;
			}
		}
		.columns-content {
			max-height: calc(100vh - 240px); /* Viewport height */
			overflow-y: auto; /* Display vertical scrollbar when content exceeds height */
			.columns-item {
				display: flex;
				align-items: center;
				padding: 6px 0;
				box-sizing: border-box;

				.ci-checkout {
					height: auto !important;
				}
			}
		}
	}
}
</style>
