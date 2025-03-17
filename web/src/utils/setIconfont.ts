// Font icon url
const cssCdnUrlList: Array<string> = [
	'//at.alicdn.com/t/font_2298093_y6u00apwst.css',
	'//at.alicdn.com/t/c/font_3882322_9ah7y8m9175.css', //dvadmin3For projectsicon
	//'//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'
];
// Third party js url
const jsCdnUrlList: Array<string> = [];

// Dynamic batch setting font icons
export function setCssCdn() {
	if (cssCdnUrlList.length <= 0) return false;
	cssCdnUrlList.map((v) => {
		let link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = v;
		link.crossOrigin = 'anonymous';
		document.getElementsByTagName('head')[0].appendChild(link);
	});
}

// Dynamic batch setting of third partiesjs
export function setJsCdn() {
	if (jsCdnUrlList.length <= 0) return false;
	jsCdnUrlList.map((v) => {
		let link = document.createElement('script');
		link.src = v;
		document.body.appendChild(link);
	});
}

/**
 * Set font icons in batches、dynamicjs
 * @method cssCdn Dynamic batch setting font icons
 * @method jsCdn Dynamic batch setting of third partiesjs
 */
const setIntroduction = {
	// set upcss
	cssCdn: () => {
		setCssCdn();
	},
	// set upjs
	jsCdn: () => {
		setJsCdn();
	},
};

// Export function method
export default setIntroduction;
