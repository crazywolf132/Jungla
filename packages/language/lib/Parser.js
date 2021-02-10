"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Lexer = _interopRequireDefault(require("./Lexer"));

var _TokenType = require("./TokenType.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class Parser extends _Lexer.default {
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
    type.forEach(t => {
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
        case _TokenType.TokenType.HASH:
          this.parseImport().map(impt => result.push(impt));
          break;

        case _TokenType.TokenType.LBRACE:
        default:
          result.push(this.parseQuery());
      }

      if (this.end()) {
        return result;
      }
    }
  }

  parseQuery() {
    return {
      type: 'Query',
      fields: this.parseFieldList()
    };
  }

  parseImport() {
    // Import the file here...
    this.eat(_TokenType.TokenType.HASH);
    let file = this.parseString();
    let result = new Parser(readFileSync(`${process.cwd()}/${file}`).toString('utf-8')).parse();
    this.eat(_TokenType.TokenType.SEMICOLON);
    return result;
  }

  parseIdentifier() {
    return this.expect(_TokenType.TokenType.IDENTIFIER).value;
  }

  parseString() {
    return this.expect(_TokenType.TokenType.STRING).value;
  }

  parseNumber() {
    return this.expect(_TokenType.TokenType.NUMBER).value;
  }

  parseDefault() {
    // TODO: Allow this to only work if we are sure it is a flow control statement.
    let comparator = this.expectMany(_TokenType.TokenType.EQUALS, _TokenType.TokenType.GT, _TokenType.TokenType.LT, _TokenType.TokenType.NOT, _TokenType.TokenType.WILD); // checking if the is a value, then a '?'... as this would
    // imply that we are dealing with an if statement.
    // let _var = this.expect(this.lookahead.type).value;

    let _var = this.parseValue();

    if (this.eat(_TokenType.TokenType.QMARK)) {
      // This means it is an if-else statement
      let _check = _var;

      let _if = this.match(_TokenType.TokenType.LBRACE) ? this.parseFieldList() : this.expect(this.lookahead.type).value;

      this.expect(_TokenType.TokenType.COLON);

      let _else = this.match(_TokenType.TokenType.LBRACE) ? this.parseFieldList() : this.expect(this.lookahead.type).value;

      return {
        comparator: comparator.type.name,
        _check,
        _if,
        _else
      };
    } else {
      return _var.type === 'Reference' ? _var : _var.value;
    }
  }

  parseList() {
    this.expect(_TokenType.TokenType.LSQUARE);
    let fields = this.parseFieldList();
    this.expect(_TokenType.TokenType.RSQUARE);
    return fields;
  }

  parseSize() {
    this.expect(_TokenType.TokenType.LT);
    let size = this.parseNumber();

    if (this.eat(_TokenType.TokenType.COMMA)) {
      // This means there is a start and finish position
      // specified...
      // We will return from straight inside this function...
      let finishPos = this.parseNumber();
      this.expect(_TokenType.TokenType.GT);
      return [size, finishPos];
    }

    this.expect(_TokenType.TokenType.GT);
    return size;
  }

  parseType() {
    return this.expectMany(_TokenType.TokenType.TYPE_LIST, _TokenType.TokenType.TYPE_NUMBER, _TokenType.TokenType.TYPE_OBJ, _TokenType.TokenType.TYPE_STRING);
  }

  parseFieldList() {
    this.expect(_TokenType.TokenType.LBRACE);
    const fields = [];
    let first = true;

    while (!this.match(_TokenType.TokenType.RBRACE) && !this.end()) {
      if (first) {
        first = false;
      } else {
        this.expect(_TokenType.TokenType.COMMA);
      }

      if (this.match(_TokenType.TokenType.AMP)) {
        fields.push(this.parseReference());
      } else if (this.match(_TokenType.TokenType.AT)) {
        fields.push(this.parseVar());
      } else {
        fields.push(this.parseField());
      }
    }

    this.expect(_TokenType.TokenType.RBRACE);
    return fields;
  }

  parseField() {
    const name = this.parseIdentifier();
    const params = this.eat(_TokenType.TokenType.LPAREN) ? this.parseParams() : null;
    const alias = this.eat(_TokenType.TokenType.AS) ? this.parseIdentifier() : null;
    const toConvert = this.eat(_TokenType.TokenType.CONVERT) ? this.parseConversion() : null;
    const sizeLimit = this.match(_TokenType.TokenType.LT) ? this.parseSize() : null; // TODO::: CREATE THE 'ADD' FIELD HERE

    const add = this.match(_TokenType.TokenType.PLUS) ? this.parseAdd() : null;
    const listFields = this.eat(_TokenType.TokenType.COLON) ? this.parseList() : null;
    const defaultValue = this.match(_TokenType.TokenType.EQUALS) ? this.parseDefault() : null;
    const RequiredType = this.eat(_TokenType.TokenType.IS) ? this.parseType() : null;
    const fields = this.match(_TokenType.TokenType.LBRACE) ? this.parseFieldList() : [];

    if (listFields) {
      return {
        type: 'List',
        name,
        alias,
        params,
        sizeLimit,
        listFields
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
      fields
    };
  }

  parseParams() {
    // We are going to expect the following:
    // IDENTIFIER CONDITION LITERAL,
    const params = [];
    let first = true;

    while (!this.match(_TokenType.TokenType.RPAREN) && !this.end()) {
      if (first) {
        first = false;
      } else {
        this.expect(_TokenType.TokenType.COMMA);
      } // Getting the IDENTIFIER.


      let name = this.expect(_TokenType.TokenType.IDENTIFIER).value;

      if (this.eat(_TokenType.TokenType.OR)) {
        do {
          if (!Array.isArray(name)) {
            name = [name];
          }

          name.push(this.expect(_TokenType.TokenType.IDENTIFIER).value);
        } while (this.eat(_TokenType.TokenType.OR));
      }

      let condition = this.expectMany(_TokenType.TokenType.EQUALS, _TokenType.TokenType.GT, _TokenType.TokenType.LT, _TokenType.TokenType.NOT, _TokenType.TokenType.WILD).type.name;
      let value = this.parseValue().value;

      if (this.eat(_TokenType.TokenType.OR)) {
        do {
          if (!Array.isArray(value)) {
            value = [value];
          }

          value.push(this.parseValue().value);
        } while (this.eat(_TokenType.TokenType.OR));
      }

      params.push({
        name,
        condition,
        value
      });
    }

    this.expect(_TokenType.TokenType.RPAREN);
    return params;
  }

  parseConversion() {
    // Should have already consumed the `->` conversion character.
    return this.expectMany(_TokenType.TokenType.TYPE_LIST, _TokenType.TokenType.TYPE_LIST_KEYS, _TokenType.TokenType.TYPE_STRING, _TokenType.TokenType.TYPE_COUNT).value;
  }

  parseAdd() {
    this.expect(_TokenType.TokenType.PLUS);
    let result = this.parseValue();
    return {
      value: result.type === 'Reference' ? result : result.value
    };
  }

  parseValue() {
    switch (this.lookahead.type) {
      case _TokenType.TokenType.AMP:
        return this.parseReference();

      case _TokenType.TokenType.AT:
        return this.parseVar();

      case _TokenType.TokenType.LT:
        return this.parseVariable();

      case _TokenType.TokenType.NUMBER:
      case _TokenType.TokenType.STRING:
        return {
          type: 'Literal',
          value: this.lex().value
        };

      case _TokenType.TokenType.LBRACE:
        return this.parseQuery();

      case _TokenType.TokenType.NULL:
      case _TokenType.TokenType.TRUE:
      case _TokenType.TokenType.FALSE:
        return {
          type: 'Literal',
          value: JSON.parse(this.lex().value)
        };
    }

    throw this.createUnexpected(this.lookahead);
  }

  parseReference() {
    this.expect(_TokenType.TokenType.AMP);
    const name = this.expectMany(_TokenType.TokenType.NUMBER, _TokenType.TokenType.IDENTIFIER).value;
    const alias = this.eat(_TokenType.TokenType.AS) ? this.parseIdentifier() : null;

    if (name) {
      return {
        type: 'Reference',
        name,
        alias
      };
    } else {
      throw this.createUnexpected(this.lookahead);
    }
  }

  parseVar() {
    this.expect(_TokenType.TokenType.AT);
    const name = this.expect(_TokenType.TokenType.IDENTIFIER).value; // Checking if it is an if-else statement or an obj with '{'

    const ifelse = this.eat(_TokenType.TokenType.TILD) ? this.parseDefault() : null;
    const value = this.eat(_TokenType.TokenType.EQUALS) ? this.parseValue().value : null;
    const fields = this.match(_TokenType.TokenType.LBRACE) ? this.parseFieldList() : [];
    return {
      type: 'Var',
      name,
      ifelse,
      value,
      fields,
      isVar: true
    };
  }

  parseVariable() {
    this.expect(_TokenType.TokenType.LT);
    const name = this.expect(_TokenType.TokenType.IDENTIFIER).value;
    this.expect(_TokenType.TokenType.GT);
    return {
      type: 'Variable',
      name
    };
  }

}

exports.default = Parser;