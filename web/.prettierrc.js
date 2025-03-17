module.exports = {
	// How many characters can be found in a line
	printWidth: 150,
	// Specify the number of spaces for each indentation level
	tabWidth: 2,
	// Use tabs instead of space dents
	useTabs: true,
	// Print a semicolon at the end of the statement
	semi: true,
	// Use single quotes instead of double quotes
	singleQuote: true,
	// Time to change the attributes of the reference object Optional value"<as-needed|consistent|preserve>"
	quoteProps: 'as-needed',
	// existJSXUse single quotes instead of double quotes
	jsxSingleQuote: false,
	// Print trailing commas whenever possible when multiple lines。（For example，Single-line arrays never end with comma。） Optional value"<none|es5|all>"，defaultnone
	trailingComma: 'es5',
	// Print spaces between brackets in object text
	bracketSpacing: true,
	// jsx The reverse angle brackets of the label require a line break
	jsxBracketSameLine: false,
	// Include brackets around individual arrow function parameters always：(x) => x \ avoid：x => x
	arrowParens: 'always',
	// These two options can be used to format to give a character offset（Include and not include）Start and end code
	rangeStart: 0,
	rangeEnd: Infinity,
	// Specify the parser to use，No need to write the beginning of the file @prettier
	requirePragma: false,
	// No need to insert automatically at the beginning of the file @prettier
	insertPragma: false,
	// Use the default line breaking standard always\never\preserve
	proseWrap: 'preserve',
	// designationHTMLGlobal space sensitivity of files css\strict\ignore
	htmlWhitespaceSensitivity: 'css',
	// VueFile scripts and style tag indentation
	vueIndentScriptAndStyle: false,
	// Line breaks lf The ending is Optional value"<auto|lf|crlf|cr>"
	endOfLine: 'lf',
};
