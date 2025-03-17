import type { App } from 'vue';
import { authDirective } from '/@/directive/authDirective';
import { wavesDirective, dragDirective } from '/@/directive/customDirective';
import {resizeObDirective} from '/@/directive/sizeDirective'
/**
 * Export command method：v-xxx
 * @methods authDirective User permission command，usage：v-auth
 * @methods wavesDirective Button Wave Command，usage：v-waves
 * @methods dragDirective Custom drag commands，usage：v-drag
 */
export function directive(app: App) {
	// User permission command
	authDirective(app);
	// Button Wave Command
	wavesDirective(app);
	// Custom drag commands
	dragDirective(app);
	//  Listen to window size changes
	resizeObDirective(app)
}
