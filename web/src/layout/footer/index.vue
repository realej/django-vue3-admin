<template>
	<div class="layout-footer pb5 pt2">
		<div class="layout-footer-warp">
			<div>❤️ Powered by Django-Vue3-Admin Copyright © DVAdminteam ❤️</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutFooter">
// There is a content here（Comments are also required），Otherwise the cache will fail
</script>

<style scoped lang="scss">
.layout-footer {
	width: 100%;
	display: flex;
	&-warp {
		margin: auto;
		color: var(--el-text-color-secondary);
		text-align: center;
		animation: error-num 0.3s ease;
	}
}
</style>
