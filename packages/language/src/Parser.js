import Lexer from './Lexer';
import { TokenType } from './TokenType.js';

let readFileSync;

try {
	readFileSync = require('fs').readFileSync;
} catch (e) {
	if (e.code !== 'MODULE_NOT_FOUND') {
		throw e;
	}
	readFileSync = () => {
		// We are making a function that wont actually return anything more than an error message.
		return `{
			error = "# Imports can only be handled server side for security reasons..."
		}`;
	};
}

export default class Parser extends Lexer {
	match(type) {
		return this.lookahead.type === type;
	}

	eat(type) {
		if (this.match(type)) {
			return this.lex();
		}

		return null;
	}

	expect(type) {
		if (this.match(type)) {
			return this.lex();
		}

		throw this.createUnexpected(this.lookahead);
	}

	expectMany(...type) {
		let found;
		type.forEach((t) => {
			if (this.match(t)) {
				found = this.lex();
			}
		});

		if (!found) {
			throw this.createUnexpected(this.lookahead);
		} else {
			return found;
		}
	}

	parse() {
		let result = [];
		while (!this.end()) {
			switch (this.lookahead.type) {
				case TokenType.HASH:
					this.parseImport().map((impt) => result.push(impt));
					break;
				case TokenType.LBRACE:
				default:
					result.push(this.parseQuery());
			}

			if (this.end()) {
				return result;
			}
		}
	}

	parseQuery() {
		return { type: 'Query', fields: this.parseFieldList() };
	}

	parseImport() {
		// Import the file here...
		this.eat(TokenType.HASH);
		let file = this.parseString();
		let result = new Parser(
			readFileSync(`${process.cwd()}/${file}`).toString('utf-8')
		).parse();
		this.eat(TokenType.SEMICOLON);
		return result;
	}

	parseIdentifier() {
		return this.expect(TokenType.IDENTIFIER).value;
	}

	parseString() {
		return this.expect(TokenType.STRING).value;
	}

	parseNumber() {
		return this.expectMany(TokenType.NUMBER, TokenType.ELLIPSIS).value;
	}

	parseDefault() {
		// TODO: Allow this to only work if we are sure it is a flow control statement.
		let comparator = this.expectMany(
			TokenType.EQUALS,
			TokenType.GT,
			TokenType.LT,
			TokenType.NOT,
			TokenType.WILD
		);
		// checking if the is a value, then a '?'... as this would
		// imply that we are dealing with an if statement.
		// let _var = this.expect(this.lookahead.type).value;
		let _var = this.parseValue();
		if (this.eat(TokenType.QMARK)) {
			// This means it is an if-else statement
			let _check = _var;

			let _if = this.match(TokenType.LBRACE)
				? this.parseFieldList()
				: this.expect(this.lookahead.type).value;
			this.expect(TokenType.COLON);

			let _else = this.match(TokenType.LBRACE)
				? this.parseFieldList()
				: this.expect(this.lookahead.type).value;
			return {
				comparator: comparator.type.name,
				_check,
				_if,
				_else,
			};
		} else {
			return _var.type === 'Reference' ? _var : _var.value;
		}
	}

	parseList() {
		this.expect(TokenType.LSQUARE);
		let fields = this.parseFieldList();
		this.expect(TokenType.RSQUARE);

		return fields;
	}

	parseSize() {
		this.expect(TokenType.LT);
		let size = this.parseNumber();
		if (this.eat(TokenType.COMMA)) {
			// This means there is a start and finish position
			// specified...

			// We will return from straight inside this function...
			let finishPos = this.parseNumber();
			this.expect(TokenType.GT);
			return [size, finishPos];
		}
		this.expect(TokenType.GT);
		return size;
	}

	parseType() {
		return this.expectMany(
			TokenType.TYPE_LIST,
			TokenType.TYPE_NUMBER,
			TokenType.TYPE_OBJ,
			TokenType.TYPE_STRING
		);
	}

	parseFieldList() {
		this.expect(TokenType.LBRACE);
		// before we begin... we are going to check to see if there is a query instead...
		// const params = this.eat(TokenType.LPAREN) ? this.parseParams() : null;

		const fields = [];
		let first = true;

		while (!this.match(TokenType.RBRACE) && !this.end()) {
			if (first) {
				first = false;
			} else {
				this.expect(TokenType.COMMA);
			}

			if (this.match(TokenType.AMP)) {
				fields.push(this.parseReference());
			} else if (this.match(TokenType.AT)) {
				fields.push(this.parseVar());
			} else if (this.match(TokenType.LPAREN)) {
				this.eat(TokenType.LPAREN);
				let params = this.parseParams();
				let inside = this.parseFieldList();
				inside.map((i) => {
					fields.push({ ...i, params });
				});
			} else {
				fields.push(this.parseField());
			}
		}

		this.expect(TokenType.RBRACE);
		return fields;
	}

	parseField() {
		const name = this.parseIdentifier();
		const params = this.eat(TokenType.LPAREN) ? this.parseParams() : null;
		const alias = this.eat(TokenType.AS) ? this.parseIdentifier() : null;
		const toConvert = this.eat(TokenType.CONVERT)
			? this.parseConversion()
			: null;
		const sizeLimit = this.match(TokenType.LT) ? this.parseSize() : null;
		const add = this.match(TokenType.PLUS) ? this.parseAdd() : null;
		const listFields = this.eat(TokenType.COLON) ? this.parseList() : null;
		const defaultValue = this.match(TokenType.EQUALS)
			? this.parseDefault()
			: null;
		const RequiredType = this.eat(TokenType.IS) ? this.parseType() : null;
		const fields = this.match(TokenType.LBRACE)
			? this.parseFieldList()
			: [];

		if (listFields) {
			return {
				type: 'List',
				name,
				alias,
				params,
				sizeLimit,
				listFields,
			};
		}
		return {
			type: 'Field',
			params,
			name,
			alias,
			toConvert,
			sizeLimit,
			add,
			RequiredType,
			defaultValue,
			fields,
		};
	}

	parseParams() {
		// We are going to expect the following:
		// IDENTIFIER CONDITION LITERAL,

		const params = [];

		let first = true;
		while (!this.match(TokenType.RPAREN) && !this.end()) {
			if (first) {
				first = false;
			} else {
				this.expect(TokenType.COMMA);
			}

			// Getting the IDENTIFIER.
			let name = this.expect(TokenType.IDENTIFIER).value;
			if (this.eat(TokenType.OR)) {
				do {
					if (!Array.isArray(name)) {
						name = [name];
					}
					name.push(this.expect(TokenType.IDENTIFIER).value);
				} while (this.eat(TokenType.OR));
			}
			let condition = this.expectMany(
				TokenType.EQUALS,
				TokenType.GT,
				TokenType.LT,
				TokenType.NOT,
				TokenType.WILD
			).type.name;
			let value = this.parseValue().value;

			if (this.eat(TokenType.OR)) {
				do {
					if (!Array.isArray(value)) {
						value = [value];
					}
					value.push(this.parseValue().value);
				} while (this.eat(TokenType.OR));
			}

			params.push({ name, condition, value });
		}

		this.expect(TokenType.RPAREN);

		return params;
	}

	parseConversion() {
		// Should have already consumed the `->` conversion character.
		return this.expectMany(
			TokenType.TYPE_LIST,
			TokenType.TYPE_LIST_KEYS,
			TokenType.TYPE_STRING,
			TokenType.TYPE_COUNT
		).value;
	}

	parseAdd() {
		this.expect(TokenType.PLUS);
		let result = this.parseValue();
		return { value: result.type === 'Reference' ? result : result.value };
	}

	parseValue() {
		switch (this.lookahead.type) {
			case TokenType.AMP:
				return this.parseReference();
			case TokenType.AT:
				return this.parseVar();
			case TokenType.LT:
				return this.parseVariable();
			case TokenType.NUMBER:
			case TokenType.STRING:
				return {
					type: 'Literal',
					value: this.lex().value,
				};
			case TokenType.LBRACE:
				return this.parseQuery();
			case TokenType.NULL:
			case TokenType.TRUE:
			case TokenType.FALSE:
				return {
					type: 'Literal',
					value: JSON.parse(this.lex().value),
				};
		}

		throw this.createUnexpected(this.lookahead);
	}

	parseReference() {
		this.expect(TokenType.AMP);

		const name = this.expectMany(TokenType.NUMBER, TokenType.IDENTIFIER)
			.value;

		const alias = this.eat(TokenType.AS) ? this.parseIdentifier() : null;

		if (name) {
			return { type: 'Reference', name, alias };
		} else {
			throw this.createUnexpected(this.lookahead);
		}
	}

	parseVar() {
		this.expect(TokenType.AT);
		const name = this.expect(TokenType.IDENTIFIER).value;
		// Checking if it is an if-else statement or an obj with '{'
		const ifelse = this.eat(TokenType.TILD) ? this.parseDefault() : null;
		const value = this.eat(TokenType.EQUALS)
			? this.parseValue().value
			: null;
		const fields = this.match(TokenType.LBRACE)
			? this.parseFieldList()
			: [];

		return {
			type: 'Var',
			name,
			ifelse,
			value,
			fields,
			isVar: true,
		};
	}

	parseVariable() {
		this.expect(TokenType.LT);
		const name = this.expect(TokenType.IDENTIFIER).value;
		this.expect(TokenType.GT);

		return { type: 'Variable', name };
	}
}
