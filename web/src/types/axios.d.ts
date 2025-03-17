/* eslint-disable */
import * as axios from 'axios';

// Extended axios Data return type，Can be expanded by itself
declare module 'axios' {
	export interface AxiosResponse<T = any> {
		code: number;
		data: T;
		message: string;
		type?: string;
		[key: string]: T;
	}
}
