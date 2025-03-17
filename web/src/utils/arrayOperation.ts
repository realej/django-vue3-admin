/**
 * Determine whether the two array strings are the same（Used for button permission verification），When the same exists in the array string, it will be automatically deduplicated.（Button permissions will not be repeated）
 * @param news New data
 * @param old Source data
 * @returns The same return of both arrays `true`，Otherwise, it is reversed
 */
export function judementSameArr(newArr: unknown[] | string[], oldArr: string[]): boolean {
	const news = removeDuplicate(newArr);
	const olds = removeDuplicate(oldArr);
	let count = 0;
	const leng = news.length;
	for (let i in olds) {
		for (let j in news) {
			if (olds[i] === news[j]) count++;
		}
	}
	return count === leng ? true : false;
}

/**
 * Determine whether the two objects are the same
 * @param a Object to compare one
 * @param b Object Two to compare
 * @returns Same return true，Otherwise, it is reversed
 */
export function isObjectValueEqual<T>(a: T, b: T): boolean {
	if (!a || !b) return false;
	let aProps = Object.getOwnPropertyNames(a);
	let bProps = Object.getOwnPropertyNames(b);
	if (aProps.length != bProps.length) return false;
	for (let i = 0; i < aProps.length; i++) {
		let propName = aProps[i];
		let propA = a[propName];
		let propB = b[propName];
		if (!b.hasOwnProperty(propName)) return false;
		if (propA instanceof Object) {
			if (!isObjectValueEqual(propA, propB)) return false;
		} else if (propA !== propB) {
			return false;
		}
	}
	return true;
}

/**
 * Array、Deduplication of array objects
 * @param arr Array content
 * @param attr Key value that needs to be deduplicated（Array Objects）
 * @returns
 */
export function removeDuplicate(arr: EmptyArrayType, attr?: string) {
	if (!Object.keys(arr).length) {
		return arr;
	} else {
		if (attr) {
			const obj: EmptyObjectType = {};
			return arr.reduce((cur: EmptyArrayType[], item: EmptyArrayType) => {
				obj[item[attr]] ? '' : (obj[item[attr]] = true && item[attr] && cur.push(item));
				return cur;
			}, []);
		} else {
			return [...new Set(arr)];
		}
	}
}
