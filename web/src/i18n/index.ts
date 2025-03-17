import { createI18n } from 'vue-i18n';
import pinia from '/@/stores/index';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';

// Define language international content

/**
 * illustrate：
 * Must be in pages Create a new folder under（suggestion `International interface catalog` and `i18n Table of contents` same，Convenient search），
 * Pay attention to the fields defined by internationalization，Do not be the same as the original definition field。
 * 1、/src/i18n/lang Next ts International content for the framework
 * 2、/src/i18n/pages Next ts International content for various interfaces
 */

// element plus Introduce internationalization
import enLocale from 'element-plus/es/locale/lang/en';
import zhcnLocale from 'element-plus/es/locale/lang/zh-cn';
import zhtwLocale from 'element-plus/es/locale/lang/zh-tw';

// Define variable content
const messages = {};
const element = { en: enLocale, 'zh-cn': zhcnLocale, 'zh-tw': zhtwLocale };
const itemize = { en: [], 'zh-cn': [], 'zh-tw': [] };
const modules: Record<string, any> = import.meta.glob('./**/*.ts', { eager: true });

// For automatic introduction modules Category en、zh-cn、zh-tw
// https://vitejs.cn/vite3-cn/guide/features.html#glob-import
for (const path in modules) {
	const key = path.match(/(\S+)\/(\S+).ts/);
	if (itemize[key![2]]) itemize[key![2]].push(modules[path].default);
	else itemize[key![2]] = modules[path];
}

// Merge array objects（Non-standard array objects，Each item of an object in an array key、value All are different）
function mergeArrObj<T>(list: T, key: string) {
	let obj = {};
	list[key].forEach((i: EmptyObjectType) => {
		obj = Object.assign({}, obj, i);
	});
	return obj;
}

// Process the final format
for (const key in itemize) {
	messages[key] = {
		name: key,
		el: element[key].el,
		message: mergeArrObj(itemize, key),
	};
}

// Read pinia Default Language
const stores = useThemeConfig(pinia);
const { themeConfig } = storeToRefs(stores);

// Export language internationalization
// https://vue-i18n.intlify.dev/guide/essentials/fallback.html#explicit-fallback-with-one-locale
export const i18n = createI18n({
	legacy: false,
	silentTranslationWarn: true,
	missingWarn: false,
	silentFallbackWarn: true,
	fallbackWarn: false,
	locale: themeConfig.value.globalI18n,
	fallbackLocale: zhcnLocale.name,
	messages,
});
