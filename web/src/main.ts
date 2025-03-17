import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { directive } from '/@/directive/index';
import { i18n } from '/@/i18n';
import other from '/@/utils/other';
import '/@/assets/style/tailwind.css'; // Introduce firsttailwind css, so as not toelement-plusconflict
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import '/@/theme/index.scss';
import mitt from 'mitt';
import VueGridLayout from 'vue-grid-layout';
import piniaPersist from 'pinia-plugin-persist';
// @ts-ignore
import fastCrud from './settings.ts';
import pinia from './stores';
import {RegisterPermission} from '/@/plugin/permission/index';
// @ts-ignore
import eIconPicker, { iconList, analyzingIconForIconfont } from 'e-icon-picker';
import 'e-icon-picker/icon/default-icon/symbol.js'; //Basic color icon library
import 'e-icon-picker/index.css'; // Basic style，Includes basic icons
import 'font-awesome/css/font-awesome.min.css';
import elementPlus from 'e-icon-picker/icon/ele/element-plus.js'; //element-plusIcons
import fontAwesome470 from 'e-icon-picker/icon/fontawesome/font-awesome.v4.7.0.js'; //fontAwesome470Icons
import eIconList from 'e-icon-picker/icon/default-icon/eIconList.js';
import iconfont from '/@/assets/iconfont/iconfont.json'; //Introducedjsondocument
import '/@/assets/iconfont/iconfont.css'; //Introducedcss
// Automatic registration plugin
import { scanAndInstallPlugins } from '/@/views/plugins/index';
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import '/@/assets/style/reset.scss';
import 'element-tree-line/dist/style.css'

let forIconfont = analyzingIconForIconfont(iconfont); //Analysisclass
iconList.addIcon(forIconfont.list); // Add toiconfont dvadmin3oficon
iconList.addIcon(elementPlus); // Add toelement plusIcons
iconList.addIcon(fontAwesome470); // Add tofontAwesome 470Version of the icon

let app = createApp(App);

scanAndInstallPlugins(app);

app.use(eIconPicker, {
	addIconList: eIconList, //Add icon globally
	removeIconList: [], //Global Delete Icon
	zIndex: 3100, //The lowest layer of the selector bullet layer,Global configuration
});

pinia.use(piniaPersist);
directive(app);
other.elSvg(app);


app.use(VXETable)
app.use(pinia)
	.use(router)
	.use(ElementPlus, { i18n: i18n.global.t })
	.use(i18n)
	.use(VueGridLayout)
	.use(fastCrud)
	.mount('#app');

app.config.globalProperties.mittBus = mitt();
