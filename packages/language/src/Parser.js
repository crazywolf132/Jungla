import Lexer from './Lexer.js';
import { TokenType } from './TokenType.js';

import { readFile, readFileSync } from 'fs';

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
		return this.expect(TokenType.NUMBER).value;
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
		let _var = this.expect(this.lookahead.type).value;
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
			return _var;
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
			let value = this.expectMany(
				TokenType.NUMBER,
				TokenType.STRING,
				TokenType.NULL,
				TokenType.FALSE,
				TokenType.TRUE
			).value;

			if (this.eat(TokenType.OR)) {
				do {
					if (!Array.isArray(value)) {
						value = [value];
					}
					value.push(
						this.expectMany(
							TokenType.NUMBER,
							TokenType.STRING,
							TokenType.NULL,
							TokenType.FALSE,
							TokenType.TRUE
						).value
					);
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
			TokenType.TYPE_STRING
		).value;
	}

	parseValue() {
		switch (this.lookahead.type) {
			case TokenType.AMP:
				return this.parseReference();
			case TokenType.AT:
				return this.parseVar();
			case TokenType.LT:
				return this.parseVariable();
			case TokenType.Number:
			case TokenType.String:
				return {
					type: 'Literal',
					value: this.lex().value,
				};
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
		const fields = this.match(TokenType.LBRACE)
			? this.parseFieldList()
			: [];

		return {
			type: 'Var',
			name,
			ifelse,
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
