import type { App } from 'vue';

/**
 * Button Wave Command
 * @directive Default method：v-waves，like `<div v-waves></div>`
 * @directive Parameter method：v-waves=" |light|red|orange|purple|green|teal"，like `<div v-waves="'light'"></div>`
 */
export function wavesDirective(app: App) {
	app.directive('waves', {
		mounted(el, binding) {
			el.classList.add('waves-effect');
			binding.value && el.classList.add(`waves-${binding.value}`);
			function setConvertStyle(obj: { [key: string]: unknown }) {
				let style: string = '';
				for (let i in obj) {
					if (obj.hasOwnProperty(i)) style += `${i}:${obj[i]};`;
				}
				return style;
			}
			function onCurrentClick(e: { [key: string]: unknown }) {
				let elDiv = document.createElement('div');
				elDiv.classList.add('waves-ripple');
				el.appendChild(elDiv);
				let styles = {
					left: `${e.layerX}px`,
					top: `${e.layerY}px`,
					opacity: 1,
					transform: `scale(${(el.clientWidth / 100) * 10})`,
					'transition-duration': `750ms`,
					'transition-timing-function': `cubic-bezier(0.250, 0.460, 0.450, 0.940)`,
				};
				elDiv.setAttribute('style', setConvertStyle(styles));
				setTimeout(() => {
					elDiv.setAttribute(
						'style',
						setConvertStyle({
							opacity: 0,
							transform: styles.transform,
							left: styles.left,
							top: styles.top,
						})
					);
					setTimeout(() => {
						elDiv && el.removeChild(elDiv);
					}, 750);
				}, 450);
			}
			el.addEventListener('mousedown', onCurrentClick, false);
		},
		unmounted(el) {
			el.addEventListener('mousedown', () => {});
		},
	});
}

/**
 * Custom drag commands
 * @description  How to use：v-drag="[dragDom,dragHeader]"，like `<div v-drag="['.drag-container .el-dialog', '.drag-container .el-dialog__header']"></div>`
 * @description dragDom Element to be dragged，dragHeader To be dragged Header Location
 * @link Notice：https://github.com/element-plus/element-plus/issues/522
 * @lick reference：https://blog.csdn.net/weixin_46391323/article/details/105228020?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-10&spm=1001.2101.3001.4242
 */
export function dragDirective(app: App) {
	app.directive('drag', {
		mounted(el, binding) {
			if (!binding.value) return false;

			const dragDom = document.querySelector(binding.value[0]) as HTMLElement;
			const dragHeader = document.querySelector(binding.value[1]) as HTMLElement;

			dragHeader.onmouseover = () => (dragHeader.style.cursor = `move`);

			function down(e: any, type: string) {
				// Press the mouse，Calculate the distance from the current element to the viewing area
				const disX = type === 'pc' ? e.clientX - dragHeader.offsetLeft : e.touches[0].clientX - dragHeader.offsetLeft;
				const disY = type === 'pc' ? e.clientY - dragHeader.offsetTop : e.touches[0].clientY - dragHeader.offsetTop;

				// bodyCurrent width
				const screenWidth = document.body.clientWidth;
				// Visible area height(Should bebodyhigh，However, it cannot be obtained in some environments)
				const screenHeight = document.documentElement.clientHeight;

				// Dialog width
				const dragDomWidth = dragDom.offsetWidth;
				// Dialog height
				const dragDomheight = dragDom.offsetHeight;

				const minDragDomLeft = dragDom.offsetLeft;
				const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth;

				const minDragDomTop = dragDom.offsetTop;
				const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomheight;

				// The obtained value bandpx Regular Match Replacement
				let styL: any = getComputedStyle(dragDom).left;
				let styT: any = getComputedStyle(dragDom).top;

				// Pay attention toiemiddle The value obtained for the first time is the component's own50% After moving, the value is assigned topx
				if (styL.includes('%')) {
					styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100);
					styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100);
				} else {
					styL = +styL.replace(/\px/g, '');
					styT = +styT.replace(/\px/g, '');
				}

				return {
					disX,
					disY,
					minDragDomLeft,
					maxDragDomLeft,
					minDragDomTop,
					maxDragDomTop,
					styL,
					styT,
				};
			}

			function move(e: any, type: string, obj: any) {
				let { disX, disY, minDragDomLeft, maxDragDomLeft, minDragDomTop, maxDragDomTop, styL, styT } = obj;

				// Delegate through event，Calculate the distance to move
				let left = type === 'pc' ? e.clientX - disX : e.touches[0].clientX - disX;
				let top = type === 'pc' ? e.clientY - disY : e.touches[0].clientY - disY;

				// Boundary processing
				if (-left > minDragDomLeft) {
					left = -minDragDomLeft;
				} else if (left > maxDragDomLeft) {
					left = maxDragDomLeft;
				}

				if (-top > minDragDomTop) {
					top = -minDragDomTop;
				} else if (top > maxDragDomTop) {
					top = maxDragDomTop;
				}

				// Move the current element
				dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`;
			}

			/**
			 * pcend
			 * onmousedown Mouse press trigger event
			 * onmousemove The event is continuously triggered when the mouse is pressed
			 * onmouseup Mouse lift trigger event
			 */
			dragHeader.onmousedown = (e) => {
				const obj = down(e, 'pc');
				document.onmousemove = (e) => {
					move(e, 'pc', obj);
				};
				document.onmouseup = () => {
					document.onmousemove = null;
					document.onmouseup = null;
				};
			};

			/**
			 * Mobile
			 * ontouchstart When pressing finger，triggerontouchstart
			 * ontouchmove When moving your finger，triggerontouchmove
			 * ontouchend When the fingers are removed，triggerontouchend
			 */
			dragHeader.ontouchstart = (e) => {
				const obj = down(e, 'app');
				document.ontouchmove = (e) => {
					move(e, 'app', obj);
				};
				document.ontouchend = () => {
					document.ontouchmove = null;
					document.ontouchend = null;
				};
			};
		},
	});
}
