/**
 * 2020.11.29 lyt tidy
 * Tool Class Collection，Suitable for daily development
 * Added multiple lines of comment information，Put the mouse on the method name to view it
 */

/**
 * Verification percentage（No decimals）
 * @param val Current value string
 * @returns Returns the processed string
 */
export function verifyNumberPercentage(val: string): string {
	// Match spaces
	let v = val.replace(/(^\s*)|(\s*$)/g, '');
	// Only numbers and decimal points，Can't be other input
	v = v.replace(/[^\d]/g, '');
	// Can't0start
	v = v.replace(/^0/g, '');
	// The number exceeds100，Assign to maximum value100
	v = v.replace(/^[1-9]\d\d{1,3}$/, '100');
	// Return result
	return v;
}

/**
 * Verification percentage（Can be decimal）
 * @param val Current value string
 * @returns Returns the processed string
 */
export function verifyNumberPercentageFloat(val: string): string {
	let v = verifyNumberIntegerAndFloat(val);
	// The number exceeds100，Assign to maximum value100
	v = v.replace(/^[1-9]\d\d{1,3}$/, '100');
	// Exceed100No value is entered later
	v = v.replace(/^100\.$/, '100');
	// Return result
	return v;
}

/**
 * Decimal or integer(No negative numbers)
 * @param val Current value string
 * @returns Returns the processed string
 */
export function verifyNumberIntegerAndFloat(val: string) {
	// Match spaces
	let v = val.replace(/(^\s*)|(\s*$)/g, '');
	// Only numbers and decimal points，Can't be other input
	v = v.replace(/[^\d.]/g, '');
	// by0Only one entry is available at the beginning
	v = v.replace(/^0{2}$/g, '0');
	// Guaranteed that the first one is only a number，Can't be a point
	v = v.replace(/^\./g, '');
	// Decimals can only appear1Bit
	v = v.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.');
	// Keep after the decimal point2Bit
	v = v.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');
	// Return result
	return v;
}

/**
 * Positive integer verification
 * @param val Current value string
 * @returns Returns the processed string
 */
export function verifiyNumberInteger(val: string) {
	// Match spaces
	let v = val.replace(/(^\s*)|(\s*$)/g, '');
	// Remove '.' , Prevent problems when posting like 0.1.12.12
	v = v.replace(/[\.]*/g, '');
	// Remove 0 The number after the start, Prevent problems when posting like 00121323
	v = v.replace(/(^0[\d]*)$/g, '0');
	// The first one is0,Only once
	v = v.replace(/^0\d$/g, '0');
	// Match only numbers
	v = v.replace(/[^\d]/g, '');
	// Return result
	return v;
}

/**
 * Remove Chinese and spaces
 * @param val Current value string
 * @returns Returns the processed string
 */
export function verifyCnAndSpace(val: string) {
	// Match Chinese with spaces
	let v = val.replace(/[\u4e00-\u9fa5\s]+/g, '');
	// Match spaces
	v = v.replace(/(^\s*)|(\s*$)/g, '');
	// Return result
	return v;
}

/**
 * Remove English and spaces
 * @param val Current value string
 * @returns Returns the processed string
 */
export function verifyEnAndSpace(val: string) {
	// Match English with spaces
	let v = val.replace(/[a-zA-Z]+/g, '');
	// Match spaces
	v = v.replace(/(^\s*)|(\s*$)/g, '');
	// Return result
	return v;
}

/**
 * Disable space input
 * @param val Current value string
 * @returns Returns the processed string
 */
export function verifyAndSpace(val: string) {
	// Match spaces
	let v = val.replace(/(^\s*)|(\s*$)/g, '');
	// Return result
	return v;
}

/**
 * For the amount `,` Distinguish
 * @param val Current value string
 * @returns Returns the processed string
 */
export function verifyNumberComma(val: string) {
	// Call a decimal or integer(No negative numbers)method
	let v: any = verifyNumberIntegerAndFloat(val);
	// Convert string into array
	v = v.toString().split('.');
	// \B Match non-word boundaries，Both sides are word characters or both sides are non-word characters
	v[0] = v[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	// Array to string
	v = v.join('.');
	// Return result
	return v;
}

/**
 * Match text color change（When searching）
 * @param val Current value string
 * @param text String value to process
 * @param color The font highlights color when searching
 * @returns Returns the processed string
 */
export function verifyTextColor(val: string, text = '', color = 'red') {
	// Return to content，Add color
	let v = text.replace(new RegExp(val, 'gi'), `<span style='color: ${color}'>${val}</span>`);
	// Return result
	return v;
}

/**
 * Numbers to Chinese capital
 * @param val Current value string
 * @param unit default：Thousands of thousands of thousands of thousands of thousands of thousands of thousands of cents of cents
 * @returns Returns the processed string
 */
export function verifyNumberCnUppercase(val: any, unit = 'Thousands of thousands of thousands of thousands of thousands of thousands of thousands of cents of cents', v = '') {
	// Add the current content string 2indivual0，Why??
	val += '00';
	// Returns the location where a specified string value first appears in the string，Nothing appears，Then the method returns -1
	let lookup = val.indexOf('.');
	// substring：Excluded subscript content，substr：Includes the end subscript content
	if (lookup >= 0) val = val.substring(0, lookup) + val.substr(lookup + 1, 2);
	// According to content val Length，Intercept and return the corresponding capitalization
	unit = unit.substr(unit.length - val.length);
	// Looping splicing capitalization
	for (let i = 0; i < val.length; i++) {
		v += 'Zero One Two Three Si Wu Lu Qi Eight Nine'.substr(val.substr(i, 1), 1) + unit.substr(i, 1);
	}
	// Regular processing
	v = v
		.replace(/Zero angle zero points$/, 'all')
		.replace(/zero[Qianbaishi]/g, 'zero')
		.replace(/zero{2,}/g, 'zero')
		.replace(/zero([100 million|Ten thousand])/g, '$1')
		.replace(/zero+Yuan/, 'Yuan')
		.replace(/Yiling{0,3}Ten thousand/, '100 million')
		.replace(/^Yuan/, 'Zero yuan');
	// Return result
	return v;
}

/**
 * phone number
 * @param val Current value string
 * @returns return true: Correct mobile phone number
 */
export function verifyPhone(val: string) {
	// false: Incorrect mobile phone number
	if (!/^((\+|00)86)?1((3[\d])|(4[5,6,7,9])|(5[0-3,5-9])|(6[5-7])|(7[0-8])|(8[\d])|(9[1,8,9]))\d{8}$/.test(val)) return false;
	// true: Correct mobile phone number
	else return true;
}

/**
 * Domestic phone number
 * @param val Current value string
 * @returns return true: The domestic phone number is correct
 */
export function verifyTelPhone(val: string) {
	// false: Domestic phone number is incorrect
	if (!/\d{3}-\d{8}|\d{4}-\d{7}/.test(val)) return false;
	// true: The domestic phone number is correct
	else return true;
}

/**
 * Log in to your account (Start with letters，allow5-16byte，Allow alphanumeric underline)
 * @param val Current value string
 * @returns return true: Log in to the account correctly
 */
export function verifyAccount(val: string) {
	// false: Login to the account incorrectly
	if (!/^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(val)) return false;
	// true: Log in to the account correctly
	else return true;
}

/**
 * password (Start with letters，The length is6~16between，Only include letters、Numbers and underlines)
 * @param val Current value string
 * @returns return true: Correct password
 */
export function verifyPassword(val: string) {
	// false: Incorrect password
	if (!/^[a-zA-Z]\w{5,15}$/.test(val)) return false;
	// true: Correct password
	else return true;
}

/**
 * Strong password (letter+number+Special characters，The length is6-16between)
 * @param val Current value string
 * @returns return true: The strong password is correct
 */
export function verifyPasswordPowerful(val: string) {
	// false: Strong password is incorrect
	if (!/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(val))
		return false;
	// true: The strong password is correct
	else return true;
}

/**
 * Password strength
 * @param val Current value string
 * @description weak：Pure numbers，Pure letters，Pure special characters
 * @description middle：letter+number，letter+Special characters，number+Special characters
 * @description powerful：letter+number+Special characters
 * @returns Returns the processed string：weak、middle、powerful
 */
export function verifyPasswordStrength(val: string) {
	let v = '';
	// weak：Pure numbers，Pure letters，Pure special characters
	if (/^(?:\d+|[a-zA-Z]+|[!@#$%^&\.*]+){6,16}$/.test(val)) v = 'weak';
	// middle：letter+number，letter+Special characters，number+Special characters
	if (/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(val)) v = 'middle';
	// powerful：letter+number+Special characters
	if (/^(?![a-zA-z]+$)(?!\d+$)(?![!@#$%^&\.*]+$)(?![a-zA-z\d]+$)(?![a-zA-z!@#$%^&\.*]+$)(?![\d!@#$%^&\.*]+$)[a-zA-Z\d!@#$%^&\.*]{6,16}$/.test(val))
		v = 'powerful';
	// Return result
	return v;
}

/**
 * IPaddress
 * @param val Current value string
 * @returns return true: IPCorrect address
 */
export function verifyIPAddress(val: string) {
	// false: IPIncorrect address
	if (
		!/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/.test(
			val
		)
	)
		return false;
	// true: IPCorrect address
	else return true;
}

/**
 * Mail
 * @param val Current value string
 * @returns return true: Correct email
 */
export function verifyEmail(val: string) {
	// false: Incorrect email address
	if (
		!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
			val
		)
	)
		return false;
	// true: Correct email
	else return true;
}

/**
 * ID card
 * @param val Current value string
 * @returns return true: Correct ID card
 */
export function verifyIdCard(val: string) {
	// false: Incorrect ID card
	if (!/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(val)) return false;
	// true: Correct ID card
	else return true;
}

/**
 * Name
 * @param val Current value string
 * @returns return true: Correct name
 */
export function verifyFullName(val: string) {
	// false: Incorrect name
	if (!/^[\u4e00-\u9fa5]{1,6}(·[\u4e00-\u9fa5]{1,6}){0,2}$/.test(val)) return false;
	// true: Correct name
	else return true;
}

/**
 * postal code
 * @param val Current value string
 * @returns return true: Correct postal code
 */
export function verifyPostalCode(val: string) {
	// false: Incorrect postal code
	if (!/^[1-9][0-9]{5}$/.test(val)) return false;
	// true: Correct postal code
	else return true;
}

/**
 * url deal with
 * @param val Current value string
 * @returns return true: url correct
 */
export function verifyUrl(val: string) {
	// false: urlIncorrect
	if (
		!/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
			val
		)
	)
		return false;
	// true: urlcorrect
	else return true;
}

/**
 * License plate number
 * @param val Current value string
 * @returns return true：Correct license plate number
 */
export function verifyCarNum(val: string) {
	// false: Incorrect license plate number
	if (
		!/^(([Beijing, Tianjin, Shanghai, Chongqing, Hebei, Henan, Yunnan, Hunan, Anhui, Shandong, New Jiangsu, Zhejiang, Jiangxi, Hubei, Guizhou, Gansu, Shanxi, Mongolia, Shaanxi, Ji, Fujian, Guangdong, Qinghai, Tibet, Sichuan, Ningqiong envoy][A-Z](([0-9]{5}[DF])|([DF]([A-HJ-NP-Z0-9])[0-9]{4})))|([Beijing, Tianjin, Shanghai, Chongqing, Hebei, Henan, Yunnan, Hunan, Anhui, Shandong, New Jiangsu, Zhejiang, Jiangxi, Hubei, Guizhou, Gansu, Shanxi, Mongolia, Shaanxi, Ji, Fujian, Guangdong, Qinghai, Tibet, Sichuan, Ningqiong envoy][A-Z][A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9Hangoutong Hong Kong and Macao envoys]))$/.test(
			val
		)
	)
		return false;
	// true：Correct license plate number
	else return true;
}
