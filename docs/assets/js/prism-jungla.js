Prism.languages.Jungla = {
	string: {
		pattern: /"(?:\\.|[^\\"\r\n])*"/,
		greedy: true,
	},
	number: /(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
	boolean: /\b(?:true|false|null)\b/,
	// variable: /\$[a-z_]\w*/i,
	variable: /@[a-z_]\w*/i,
	keyword: /\b(?:STRING|NUMBER|LIST|OBJ|BOOL|#)\b/,
	'attr-name': {
		pattern: /[a-z_]\w*(?=\s*(?:\((?:[^()"]|"(?:\\.|[^\\"\r\n])*")*\))?:)/i,
		greedy: true,
	},
	operator: {
		pattern: /(^|[^.])(?:\+[+=]?|-[-=]?|!=?|<<?=?|>>?>?=?|==?|&[&=]?|and|@|#|\|[|=]?|\|\||is|\*=?|\/=?|%=?|\^=?|[?:~])/m,
		lookbehind: true,
	},
	punctuation: /[!(){}\[\]=~,<>]/,
	constant: /\b(?!ID\b)[A-Z][A-Z_\d]*\b/,
};
