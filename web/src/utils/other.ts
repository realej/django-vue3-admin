import { nextTick, defineAsyncComponent } from 'vue';
import type { App } from 'vue';
import * as svg from '@element-plus/icons-vue';
import router from '/@/router/index';
import pinia from '/@/stores/index';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { i18n } from '/@/i18n/index';
import { Local } from '/@/utils/storage';
import { verifyUrl } from '/@/utils/toolsValidate';
import {SystemConfigStore} from "/@/stores/systemConfig";

// Introducing components
const SvgIcon = defineAsyncComponent(() => import('/@/components/svgIcon/index.vue'));

/**
 * Export global registration element plus svg icon
 * @param app vue Example
 * @description use：https://element-plus.gitee.io/zh-CN/component/icon.html
 */
export function elSvg(app: App) {
	const icons = svg as any;
	for (const i in icons) {
		app.component(`ele-${icons[i].name}`, icons[i]);
	}
	app.component('SvgIcon', SvgIcon);
}

/**
 * Set up browser title internationalization
 * @method const title = useTitle(); ==> title()
 */
export function useTitle() {
	const stores = SystemConfigStore(pinia);
	const { systemConfig }: { systemConfig: any} = storeToRefs(stores);
	nextTick(() => {
		let webTitle = '';
		let globalTitle: string = systemConfig['base.web_title'];
		const { path, meta } = router.currentRoute.value;
		if (path === '/login') {
			webTitle = <string>meta.title;
		} else {
			webTitle = setTagsViewNameI18n(router.currentRoute.value);
		}
		// document.title = `${webTitle} - ${globalTitle}` || "DVAdmin";
		document.title = `${webTitle}`;
	});
}

/***
 * Set up a websitefaviconicon
 */
export function useFavicon() {
	const stores = SystemConfigStore(pinia);
	const { systemConfig } = storeToRefs(stores);
	nextTick(() => {
		const iconUrl = systemConfig.value['base.web_favicon']
		if(iconUrl){
			// Dynamic settings favicon，Assume here favicon of URL It is obtained dynamically or from variables
			const faviconUrl = `${iconUrl}?t=${new Date().getTime()}`;
			const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
			if (!link) {
				const newLink = document.createElement('link') as HTMLLinkElement;
				newLink.rel = 'shortcut icon';
				newLink.href = faviconUrl;
				document.head.appendChild(newLink);
			} else {
				link.href = faviconUrl;
			}
		}

	});
}

/**
 * set up Customize tagsView name、 Customize tagsView Internationalized name
 * @param params routing query、params In-house tagsViewName
 * @returns Return to the current tagsViewName name
 */
export function setTagsViewNameI18n(item: any) {
	let tagsViewName: string = '';
	const { query, params, meta } = item;
	if (query?.tagsViewName || params?.tagsViewName) {
		if (/\/zh-cn|en|zh-tw\//.test(query?.tagsViewName) || /\/zh-cn|en|zh-tw\//.test(params?.tagsViewName)) {
			// Internationalization
			const urlTagsParams = (query?.tagsViewName && JSON.parse(query?.tagsViewName)) || (params?.tagsViewName && JSON.parse(params?.tagsViewName));
			tagsViewName = urlTagsParams[i18n.global.locale.value];
		} else {
			// Non-internationalization
			tagsViewName = query?.tagsViewName || params?.tagsViewName;
		}
	} else {
		// Non-custom tagsView name
		tagsViewName = i18n.global.t(meta.title);
	}
	return tagsViewName;
}

/**
 * Lazy image loading
 * @param el dom Target elements
 * @param arr List data
 * @description data-xxx Properties are used to store private custom data for pages or applications
 */
export const lazyImg = (el: string, arr: EmptyArrayType) => {
	const io = new IntersectionObserver((res) => {
		res.forEach((v: any) => {
			if (v.isIntersecting) {
				const { img, key } = v.target.dataset;
				v.target.src = img;
				v.target.onload = () => {
					io.unobserve(v.target);
					arr[key]['loading'] = false;
				};
			}
		});
	});
	nextTick(() => {
		document.querySelectorAll(el).forEach((img) => io.observe(img));
	});
};

/**
 * Global component size
 * @returns return `window.localStorage` The cached value read in `globalComponentSize`
 */
export const globalComponentSize = (): string => {
	const stores = useThemeConfig(pinia);
	const { themeConfig } = storeToRefs(stores);
	return Local.get('themeConfig')?.globalComponentSize || themeConfig.value?.globalComponentSize;
};

/**
 * Deep cloning of objects
 * @param obj Source object
 * @returns The cloned object
 */
export function deepClone(obj: EmptyObjectType) {
	let newObj: EmptyObjectType;
	try {
		newObj = obj.push ? [] : {};
	} catch (error) {
		newObj = {};
	}
	for (let attr in obj) {
		if (obj[attr] && typeof obj[attr] === 'object') {
			newObj[attr] = deepClone(obj[attr]);
		} else {
			newObj[attr] = obj[attr];
		}
	}
	return newObj;
}

/**
 * Determine whether it is a mobile terminal
 */
export function isMobile() {
	if (
		navigator.userAgent.match(
			/('phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone')/i
		)
	) {
		return true;
	} else {
		return false;
	}
}

/**
 * Determine whether all attributes in the array object are empty，If empty, delete the current line object
 * @description @Thanks to Dahuang
 * @param list Array Objects
 * @returns Delete an array object after empty value
 */
export function handleEmpty(list: EmptyArrayType) {
	const arr = [];
	for (const i in list) {
		const d = [];
		for (const j in list[i]) {
			d.push(list[i][j]);
		}
		const leng = d.filter((item) => item === '').length;
		if (leng !== d.length) {
			arr.push(list[i]);
		}
	}
	return arr;
}

/**
 * Open an external link
 * @param val Current click menu
 */
export function handleOpenLink(val: RouteItem) {
	const { origin, pathname } = window.location;
	router.push(val.path);
	if (verifyUrl(<string>val.meta?.isLink)) window.open(val.meta?.isLink);
	else window.open(`${origin}${pathname}#${val.meta?.isLink}`);
}

/**
 * Unified batch export
 * @method elSvg Export global registration element plus svg icon
 * @method useTitle Set up browser title internationalization
 * @method setTagsViewNameI18n set up Customize tagsView name、 Customize tagsView Internationalized name
 * @method lazyImg Lazy image loading
 * @method globalComponentSize() element plus Global component size
 * @method deepClone Deep cloning of objects
 * @method isMobile Determine whether it is a mobile terminal
 * @method handleEmpty Determine whether all attributes in the array object are empty，If empty, delete the current line object
 * @method handleOpenLink Open an external link
 */
const other = {
	elSvg: (app: App) => {
		elSvg(app);
	},
	useTitle: () => {
		useTitle();
	},
	useFavicon:()=>{
		useFavicon()
	},
	setTagsViewNameI18n(route: RouteToFrom) {
		return setTagsViewNameI18n(route);
	},
	lazyImg: (el: string, arr: EmptyArrayType) => {
		lazyImg(el, arr);
	},
	globalComponentSize: () => {
		return globalComponentSize();
	},
	deepClone: (obj: EmptyObjectType) => {
		return deepClone(obj);
	},
	isMobile: () => {
		return isMobile();
	},
	handleEmpty: (list: EmptyArrayType) => {
		return handleEmpty(list);
	},
	handleOpenLink: (val: RouteItem) => {
		handleOpenLink(val);
	},
};

// Unified batch export
export default other;
