/**
 * @description Safely analyze json String
 * @param {String} jsonString Need to parse json String
 * @param {String} defaultValue default value
 */
import { uiContext } from '@fast-crud/fast-crud';

export function parse(jsonString = '{}', defaultValue = {}) {
	let result = defaultValue;
	try {
		result = JSON.parse(jsonString);
	} catch (error) {
		console.log(error);
	}
	return result;
}

/**
 * @description Interface request return
 * @param {Any} data Return value
 * @param {String} msg Status information
 * @param {Number} code Status code
 */
export function response(data = {}, msg = '', code = 0) {
	return [200, { code, msg, data }];
}

/**
 * @description Interface request return Return correctly
 * @param {Any} data Return value
 * @param {String} msg Status information
 */
export function responseSuccess(data = {}, msg = 'success') {
	return response(data, msg);
}

/**
 * @description Interface request return Error return
 * @param {Any} data Return value
 * @param {String} msg Status information
 * @param {Number} code Status code
 */
export function responseError(data = {}, msg = 'Request failed', code = 500) {
	return response(data, msg, code);
}

/**
 * @description Record and display errors
 * @param {Error} error Error object
 */
export function errorLog(error: any, notification = true) {
	// Print to console
	console.error(error);
	// Show prompt
	if (notification) {
		uiContext.get().notification.error({ message: error.message });
	}
}

/**
 * @description Create an error
 * @param {String} msg error message
 */
export function errorCreate(msg: any, notification = true) {
	const error = new Error(msg);
	errorLog(error, notification);
	// throw error;
}

/**
 * @description base64changefile
 * @param {String} base64 base64String
 * @param {String} fileName file name
 */
export function base64ToFile(base64: any, fileName: string) {
	// Willbase64according to , Perform splitting Prefix  Separate from subsequent content
	let data = base64.split(',');
	// Utilize regular expressions Get type information of the image from the prefix（image/png、image/jpeg、image/webpwait）
	let type = data[0].match(/:(.*?);/)[1];
	// From the type of image Get the specific file format suffix（png、jpeg、webp）
	let suffix = type.split('/')[1];
	// useatob()rightbase64Decode the data  The result is a file data stream Output in string format
	const bstr = window.atob(data[1]);
	// Get the length of the decoded result string
	let n = bstr.length;
	// Create an equal length shaped array of numbers based on the length of the decoded result string
	// But when created All elements have initial values 0
	const u8arr = new Uint8Array(n);
	// Fill each element of the shaping array with the corresponding position character of the decoded result stringUTF-16 Coding unit
	while (n--) {
		// charCodeAt()：Get the corresponding character at a given index UTF-16 Code Unit
		u8arr[n] = bstr.charCodeAt(n);
	}
	// Create with constructorsFileFile Object
	// new File(bits, name, options)
	const file = new File([u8arr], `${fileName}.${suffix}`, {
		type: type,
	});
	// WillFileThe file object is returned to the caller of the method
	return file;
}
