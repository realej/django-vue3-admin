<template>
	<el-form ref="formRef" size="large" class="login-content-form" :model="state.ruleForm" :rules="rules" @keyup.enter="loginClick">
		<el-form-item class="login-animation1" prop="username">
			<el-input type="text" :placeholder="$t('message.account.accountPlaceholder1')" v-model="ruleForm.username"
				clearable autocomplete="off">
				<template #prefix>
					<el-icon class="el-input__icon"><ele-User /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2" prop="password">
			<el-input :type="isShowPassword ? 'text' : 'password'" :placeholder="$t('message.account.accountPlaceholder2')"
				v-model="ruleForm.password">
				<template #prefix>
					<el-icon class="el-input__icon"><ele-Unlock /></el-icon>
				</template>
				<template #suffix>
					<i class="iconfont el-input__icon login-content-password"
						:class="isShowPassword ? 'icon-yincangmima' : 'icon-xianshimima'"
						@click="isShowPassword = !isShowPassword">
					</i>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation3" v-if="isShowCaptcha" prop="captcha">
			<el-col :span="15">
				<el-input type="text" maxlength="4" :placeholder="$t('message.account.accountPlaceholder3')"
					v-model="ruleForm.captcha" clearable autocomplete="off">
					<template #prefix>
						<el-icon class="el-input__icon"><ele-Position /></el-icon>
					</template>
				</el-input>
			</el-col>
			<el-col :span="1"></el-col>
			<el-col :span="8">
				<el-button class="login-content-captcha">
					<el-image :src="ruleForm.captchaImgBase" @click="refreshCaptcha" />
				</el-button>
			</el-col>
		</el-form-item>
		<el-form-item class="login-animation4">
			<el-button type="primary" class="login-content-submit" round @click="loginClick"
				:loading="loading.signIn">
				<span>{{ $t('message.account.accountBtnText') }}</span>
			</el-button>
		</el-form-item>
	</el-form>
  <!--      Apply for trial-->
  <div style="text-align: center" v-if="showApply()">
    <el-button class="login-content-apply" link type="primary" plain round @click="applyBtnClick">
      <span>Apply for trial</span>
    </el-button>
  </div>
</template>

<script lang="ts">
import { toRefs, reactive, defineComponent, computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, FormInstance, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import Cookies from 'js-cookie';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import * as loginApi from '/@/views/system/login/api';
import { useUserInfo } from '/@/stores/userInfo';
import { DictionaryStore } from '/@/stores/dictionary';
import { SystemConfigStore } from '/@/stores/systemConfig';
import { BtnPermissionStore } from '/@/plugin/permission/store.permission';
import { Md5 } from 'ts-md5';
import { errorMessage } from '/@/utils/message';
import {getBaseURL} from "/@/utils/baseUrl";

export default defineComponent({
	name: 'loginAccount',
	setup() {
		const { t } = useI18n();
		const storesThemeConfig = useThemeConfig();
		const { themeConfig } = storeToRefs(storesThemeConfig);
		const { userInfos } = storeToRefs(useUserInfo());
		const route = useRoute();
		const router = useRouter();
		const state = reactive({
			isShowPassword: false,
			ruleForm: {
				username: '',
				password: '',
				captcha: '',
				captchaKey: '',
				captchaImgBase: '',
			},
			loading: {
				signIn: false,
			},
		});
		const rules = reactive<FormRules>({
			username: [
				{ required: true, message: 'Please fill in your account number', trigger: 'blur' },
			],
			password: [
				{
					required: true,
					message: 'Please fill in your password',
					trigger: 'blur',
				},
			],
			captcha: [
				{
					required: true,
					message: 'Please fill in the verification code',
					trigger: 'blur',
				},
			],
		})
		const formRef = ref();
		// Time acquisition
		const currentTime = computed(() => {
			return formatAxis(new Date());
		});
		// Whether to close the verification code
		const isShowCaptcha = computed(() => {
			return SystemConfigStore().systemConfig['base.captcha_state'];
		});

		const getCaptcha = async () => {
			loginApi.getCaptcha().then((ret: any) => {
				state.ruleForm.captchaImgBase = ret.data.image_base;
				state.ruleForm.captchaKey = ret.data.key;
			});
		};
		const applyBtnClick = async () => {
			window.open(getBaseURL('/api/system/apply_for_trial/'));
		};
    const refreshCaptcha = async () => {
			state.ruleForm.captcha=''
			loginApi.getCaptcha().then((ret: any) => {
				state.ruleForm.captchaImgBase = ret.data.image_base;
				state.ruleForm.captchaKey = ret.data.key;
			});
		};
		const loginClick = async () => {
			if (!formRef.value) return
			await formRef.value.validate((valid: any) => {
				if (valid) {
					loginApi.login({ ...state.ruleForm, password: Md5.hashStr(state.ruleForm.password) }).then((res: any) => {
						if (res.code === 2000) {
              const {data} = res
              Cookies.set('username', res.data.username);
              Session.set('token', res.data.access);
              useUserInfo().setPwdChangeCount(data.pwd_change_count)
              if(data.pwd_change_count==0){
                return router.push('/login');
              }
							if (!themeConfig.value.isRequestRoutes) {
								// Front-end control routing，2、Please note the order of execution
								initFrontEndControlRoutes();
								loginSuccess();
							} else {
								// Simulate backend control routing，isRequestRoutes for true，Turn on the backend control routing
								// Add dynamic routes，Go again router Jump，Otherwise, an error may be reported No match found for location with path "/"
								initBackEndControlRoutes();
								// Completed execution initBackEndControlRoutes，Execute again signInSuccess
								loginSuccess();
							}
						}
					}).catch((err: any) => {
						// After login error，Refresh the verification code
						refreshCaptcha();
					});
				} else {
					errorMessage("Please fill in the login information")
				}
			})

		};



		// Jump after successful login
		const loginSuccess = () => {
			//Get all dictionaries
			DictionaryStore().getSystemDictionarys();
			// Initialization login success time greeting
			let currentTimeInfo = currentTime.value;
			// Login successfully，Jump to the home page
      const pwd_change_count = userInfos.value.pwd_change_count
      if(pwd_change_count>0){
        // If it is a copy-paste path，Non-Home/Login page，Then redirect to the corresponding path after logging in successfully
        if (route.query?.redirect) {
        	router.push({
        		path: <string>route.query?.redirect,
        		query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
        	});
        } else {
        	router.push('/');
        }
        // Login success prompt
        // closure loading
        state.loading.signIn = true;
        const signInText = t('message.signInText');
        ElMessage.success(`${currentTimeInfo}，${signInText}`);
      }
			// Add to loading，Prevent short-term blanks when entering the interface for the first time
			NextLoading.start();
		};
		onMounted(() => {
			getCaptcha();
			//Get system configuration
			SystemConfigStore().getSystemConfigs();
		});
    // Whether to display the application trial button
    const showApply = () => {
      return window.location.href.indexOf('public') != -1
    }

		return {
			refreshCaptcha,
			loginClick,
			loginSuccess,
			isShowCaptcha,
			state,
			formRef,
			rules,
      applyBtnClick,
      showApply,
			...toRefs(state),
		};
	},
});
</script>

<style scoped lang="scss">
.login-content-form {
	margin-top: 20px;

	@for $i from 1 through 4 {
		.login-animation#{$i} {
			opacity: 0;
			animation-name: error-num;
			animation-duration: 0.5s;
			animation-fill-mode: forwards;
			animation-delay: calc($i/10) + s;
		}
	}

	.login-content-password {
		display: inline-block;
		width: 20px;
		cursor: pointer;

		&:hover {
			color: #909399;
		}
	}

	.login-content-captcha {
		width: 100%;
		padding: 0;
		font-weight: bold;
		letter-spacing: 5px;
	}

	.login-content-submit {
		width: 100%;
		letter-spacing: 2px;
		font-weight: 800;
		margin-top: 15px;
	}
}
</style>
