import { Token } from './Token.js';

export const TokenType = {
	// Special
	END: { klass: Token.End, name: 'end' },
	IDENTIFIER: { klass: Token.Identifier, name: 'identifier' },
	NUMBER: { klass: Token.NumberLiteral, name: 'number' },
	STRING: { klass: Token.StringLiteral, name: 'string' },

	// Punctuators
	LT: { klass: Token.Punctuator, name: '<' },
	GT: { klass: Token.Punctuator, name: '>' },
	LBRACE: { klass: Token.Punctuator, name: '{' },
	RBRACE: { klass: Token.Punctuator, name: '}' },
	LPAREN: { klass: Token.Punctuator, name: '(' },
	RPAREN: { klass: Token.Punctuator, name: ')' },
	LSQUARE: { klass: Token.Punctuator, name: '[' },
	RSQUARE: { klass: Token.Punctuator, name: ']' },
	COLON: { klass: Token.Punctuator, name: ':' },
	COMMA: { klass: Token.Punctuator, name: ',' },
	AMP: { klass: Token.Punctuator, name: '&' },
	AT: { klass: Token.Punctuator, name: '@' },
	QMARK: { klass: Token.Punctuator, name: '?' },
	NOT: { klass: Token.Punctuator, name: '!' },
	HASH: { klass: Token.Punctuator, name: '#' },
	EQUALS: { klass: Token.Punctuator, name: '=' },
	TILD: { klass: Token.Punctuator, name: '~' },
	SEMICOLON: { klass: Token.Punctuator, name: ';' },
	PLUS: { klass: Token.Punctuator, name: '+' },
	WILD: { klass: Token.Punctuator, name: '*' },
	CONVERT: { klass: Token.Punctuator, name: '->' },
	OR: { klass: Token.Punctuator, name: '||' },

	// Keywords
	NULL: { klass: Token.Keyword, name: 'null' },
	TRUE: { klass: Token.Keyword, name: 'true' },
	FALSE: { klass: Token.Keyword, name: 'false' },
	AS: { klass: Token.Keyword, name: 'as' },
	IS: { klass: Token.Keyword, name: 'is' },
	TYPE_STRING: { klass: Token.Keyword, name: 'string' },
	TYPE_NUMBER: { klass: Token.Keyword, name: 'number' },
	TYPE_LIST: { klass: Token.Keyword, name: 'list' },
	TYPE_LIST_KEYS: { klass: Token.Keyword, name: 'list_keys' },
	TYPE_OBJ: { klass: Token.Keyword, name: 'obj' },
};
