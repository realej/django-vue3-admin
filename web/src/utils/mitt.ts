// https://www.npmjs.com/package/mitt
import mitt, { Emitter } from 'mitt';

// type
const emitter: Emitter<MittType> = mitt<MittType>();

// Export
export default emitter;
