/**
 * Time and date conversion
 * @param date Current time，new Date() Format
 * @param format Time format string that needs to be converted
 * @description format Strings are arbitrary，like `YYYY-mm、YYYY-mm-dd`
 * @description format Quarterly："YYYY-mm-dd HH:MM:SS QQQQ"
 * @description format Week："YYYY-mm-dd HH:MM:SS WWW"
 * @description format How many weeks："YYYY-mm-dd HH:MM:SS ZZZ"
 * @description format Quarterly + Week + How many weeks："YYYY-mm-dd HH:MM:SS WWW QQQQ ZZZ"
 * @returns Returns the spliced ​​time string
 */
export function formatDate(date: Date, format: string): string {
	let we = date.getDay(); // Week
	let z = getWeek(date); // week
	let qut = Math.floor((date.getMonth() + 3) / 3).toString(); // Quarterly
	const opt: { [key: string]: string } = {
		'Y+': date.getFullYear().toString(), // Year
		'm+': (date.getMonth() + 1).toString(), // moon(Month from0start，want+1)
		'd+': date.getDate().toString(), // day
		'H+': date.getHours().toString(), // hour
		'M+': date.getMinutes().toString(), // point
		'S+': date.getSeconds().toString(), // Second
		'q+': qut, // Quarterly
	};
	// Chinese numbers (Week)
	const week: { [key: string]: string } = {
		'0': 'day',
		'1': 'one',
		'2': 'two',
		'3': 'three',
		'4': 'Four',
		'5': 'five',
		'6': 'six',
	};
	// Chinese numbers（Quarterly）
	const quarter: { [key: string]: string } = {
		'1': 'one',
		'2': 'two',
		'3': 'three',
		'4': 'Four',
	};
	if (/(W+)/.test(format))
		format = format.replace(RegExp.$1, RegExp.$1.length > 1 ? (RegExp.$1.length > 2 ? 'Week' + week[we] : 'week' + week[we]) : week[we]);
	if (/(Q+)/.test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 4 ? '1.' + quarter[qut] + 'Quarterly' : quarter[qut]);
	if (/(Z+)/.test(format)) format = format.replace(RegExp.$1, RegExp.$1.length == 3 ? '1.' + z + 'week' : z + '');
	for (let k in opt) {
		let r = new RegExp('(' + k + ')').exec(format);
		// If the input length is not1，Then make up for zero
		if (r) format = format.replace(r[1], RegExp.$1.length == 1 ? opt[k] : opt[k].padStart(RegExp.$1.length, '0'));
	}
	return format;
}

/**
 * Get what week is the current date
 * @param dateTime The current date value passed
 * @returns Returns the weekly numeric value
 */
export function getWeek(dateTime: Date): number {
	let temptTime = new Date(dateTime.getTime());
	// What day of the week
	let weekday = temptTime.getDay() || 7;
	// week1+5sky=Saturday
	temptTime.setDate(temptTime.getDate() - weekday + 1 + 5);
	let firstDay = new Date(temptTime.getFullYear(), 0, 1);
	let dayOfWeek = firstDay.getDay();
	let spendDay = 1;
	if (dayOfWeek != 0) spendDay = 7 - dayOfWeek + 1;
	firstDay = new Date(temptTime.getFullYear(), 0, 1 + spendDay);
	let d = Math.ceil((temptTime.valueOf() - firstDay.valueOf()) / 86400000);
	let result = Math.ceil(d / 7);
	return result;
}

/**
 * Convert time to `A few seconds ago`、`A few minutes ago`、`A few hours ago`、`A few days ago`
 * @param param Current time，new Date() Format or string time format
 * @param format Time format string that needs to be converted
 * @description param 10Second：  10 * 1000
 * @description param 1point：   60 * 1000
 * @description param 1Hour： 60 * 60 * 1000
 * @description param 24Hour：60 * 60 * 24 * 1000
 * @description param 3sky：   60 * 60* 24 * 1000 * 3
 * @returns Returns the spliced ​​time string
 */
export function formatPast(param: string | Date, format: string = 'YYYY-mm-dd'): string {
	// Incoming format processing、Store converted values
	let t: any, s: number;
	// Getjs Timestamp
	let time: number = new Date().getTime();
	// Is it an object or not
	typeof param === 'string' || 'object' ? (t = new Date(param).getTime()) : (t = param);
	// Current timestamp - Pass in time stamp
	time = Number.parseInt(`${time - t}`);
	if (time < 10000) {
		// 10Within seconds
		return 'just';
	} else if (time < 60000 && time >= 10000) {
		// Exceed10Less than1Within minutes
		s = Math.floor(time / 1000);
		return `${s}Seconds ago`;
	} else if (time < 3600000 && time >= 60000) {
		// Exceed1Less than1Hour
		s = Math.floor(time / 60000);
		return `${s}Minutes ago`;
	} else if (time < 86400000 && time >= 3600000) {
		// Exceed1Less than24Hour
		s = Math.floor(time / 3600000);
		return `${s}Hour ago`;
	} else if (time < 259200000 && time >= 86400000) {
		// Exceed1Days less than3Within the day
		s = Math.floor(time / 86400000);
		return `${s}Day ago`;
	} else {
		// Exceed3sky
		let date = typeof param === 'string' || 'object' ? new Date(param) : param;
		return formatDate(date, format);
	}
}

/**
 * Time greetings
 * @param param Current time，new Date() Format
 * @description param Call `formatAxis(new Date())` Output `Good morning`
 * @returns Returns the spliced ​​time string
 */
export function formatAxis(param: Date): string {
	let hour: number = new Date(param).getHours();
	if (hour < 6) return 'Good morning';
	else if (hour < 9) return 'Good morning';
	else if (hour < 12) return 'Good morning';
	else if (hour < 14) return 'good afternoon';
	else if (hour < 17) return 'good afternoon';
	else if (hour < 19) return 'Good evening';
	else if (hour < 22) return 'Good evening';
	else return 'Good night';
}
