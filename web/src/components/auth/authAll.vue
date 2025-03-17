<template>
	<slot v-if="getUserAuthBtnList" />
</template>

<script setup lang="ts" name="authAll">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useUserInfo } from '/@/stores/userInfo';
import { judementSameArr } from '/@/utils/arrayOperation';

// Define the value passed by the parent component
const props = defineProps({
	value: {
		type: Array,
		default: () => [],
	},
});

// Define variable content
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

// Get pinia User permissions in
const getUserAuthBtnList = computed(() => {
	return judementSameArr(props.value, userInfos.value.authBtnList);
});
</script>
