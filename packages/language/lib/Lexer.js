"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _TokenType = require("./TokenType.js");

var _Token = require("./Token.js");

class Lexer {
  constructor(source) {
    this.source = source;
    this.pos = 0;
    this.line = 1;
    this.lineStart = 0;
    this.lookahead = this.next();
    this.prev = null;
  }

  get column() {
    return this.pos - this.lineStart;
  }

  getKeyword(name) {
    switch (name) {
      case 'null':
        return _TokenType.TokenType.NULL;

      case 'true':
        return _TokenType.TokenType.TRUE;

      case 'false':
        return _TokenType.TokenType.FALSE;

      case 'as':
        return _TokenType.TokenType.AS;

      case 'is':
        return _TokenType.TokenType.IS;

      case 'STRING':
        return _TokenType.TokenType.TYPE_STRING;

      case 'NUMBER':
        return _TokenType.TokenType.TYPE_NUMBER;

      case 'LIST':
        return _TokenType.TokenType.TYPE_LIST;

      case 'LIST_KEYS':
        return _TokenType.TokenType.TYPE_LIST_KEYS;

      case 'OBJ':
        return _TokenType.TokenType.TYPE_OBJ;

      case 'COUNT':
        return _TokenType.TokenType.TYPE_COUNT;
    }

    return _TokenType.TokenType.IDENTIFIER;
  }

  end() {
    return this.lookahead.type === _TokenType.TokenType.END;
  }

  peek() {
    return this.lookahead;
  }

  peekRaw(steps = 0) {
    return this.source.charAt(this.pos + (1 + steps));
  }

  lex() {
    const prev = this.lookahead;
    this.lookahead = this.next();
    return prev;
  }

  next() {
    this.prev = this.lookahead;
    this.skipWhitespace();
    const line = this.line;
    const lineStart = this.lineStart;
    const token = this.scan();
    token.line = line;
    token.column = this.pos - lineStart; // If this token is a comment... we don't want to return it at all...

    return token.type === _TokenType.TokenType.COMMENT || token.type === _TokenType.TokenType.BLOCKCOMMENT ? this.next() : token;
  }

  scan() {
    if (this.pos >= this.source.length) {
      return {
        type: _TokenType.TokenType.END
      };
    }

    const ch = this.source.charAt(this.pos);

    switch (ch) {
      case '(':
        ++this.pos;
        return {
          type: _TokenType.TokenType.LPAREN
        };

      case ')':
        ++this.pos;
        return {
          type: _TokenType.TokenType.RPAREN
        };

      case '{':
        ++this.pos;
        return {
          type: _TokenType.TokenType.LBRACE
        };

      case '}':
        ++this.pos;
        return {
          type: _TokenType.TokenType.RBRACE
        };

      case '[':
        ++this.pos;
        return {
          type: _TokenType.TokenType.LSQUARE
        };

      case ']':
        ++this.pos;
        return {
          type: _TokenType.TokenType.RSQUARE
        };

      case '<':
        ++this.pos;
        return {
          type: _TokenType.TokenType.LT
        };

      case '>':
        ++this.pos;
        return {
          type: _TokenType.TokenType.GT
        };

      case '&':
        ++this.pos;
        return {
          type: _TokenType.TokenType.AMP
        };

      case ',':
        ++this.pos;
        return {
          type: _TokenType.TokenType.COMMA
        };

      case ':':
        ++this.pos;
        return {
          type: _TokenType.TokenType.COLON
        };

      case '=':
        ++this.pos;
        return {
          type: _TokenType.TokenType.EQUALS
        };

      case '?':
        ++this.pos;
        return {
          type: _TokenType.TokenType.QMARK
        };

      case '!':
        ++this.pos;
        return {
          type: _TokenType.TokenType.NOT
        };

      case '@':
        ++this.pos;
        return {
          type: _TokenType.TokenType.AT
        };

      case '#':
        ++this.pos;
        return {
          type: _TokenType.TokenType.HASH
        };

      case '~':
        ++this.pos;
        return {
          type: _TokenType.TokenType.TILD
        };

      case ';':
        ++this.pos;
        return {
          type: _TokenType.TokenType.SEMICOLON
        };

      case '+':
        ++this.pos;
        return {
          type: _TokenType.TokenType.PLUS
        };

      case '*':
        if (this.peekRaw() === '/') {
          ++this.pos;
          ++this.pos;
          return {
            type: _TokenType.TokenType.BLOCKCOMMENTEND
          };
        }

        ++this.pos;
        return {
          type: _TokenType.TokenType.WILD
        };

      case '-':
        if (this.peekRaw() === '>') {
          ++this.pos;
          ++this.pos;
          return {
            type: _TokenType.TokenType.CONVERT
          };
        }

        break;

      case '|':
        if (this.peekRaw() === '|') {
          ++this.pos;
          ++this.pos;
          return {
            type: _TokenType.TokenType.OR
          };
        }

        break;

      case '/':
        if (this.peekRaw() === '/') {
          // Going past those two characters '//'
          ++this.pos;
          ++this.pos;

          while (this.peekRaw(-1) !== '\n' && this.pos < this.source.length) {
            ++this.pos;
          } // Going past the \n


          ++this.pos;
          return {
            type: _TokenType.TokenType.COMMENT
          };
        } else if (this.peekRaw() === '*') {
          // Going past those two characters '/*'
          ++this.pos;
          ++this.pos;

          do {
            if (this.peekRaw() === '\n') this.line++;
            ++this.pos;
          } while (!(this.peekRaw(-1) === '*' && this.peekRaw() === '/') && this.pos < this.source.length); // Going past the '*/'


          ++this.pos;
          ++this.pos;
          return {
            type: _TokenType.TokenType.BLOCKCOMMENT
          };
        } else {
          ++this.pos;
          return {
            type: _TokenType.TokenType.SLASH
          };
        }

    }

    if (ch === '_' || ch === '$' || 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z') {
      return this.scanWord();
    }

    if (ch === '-' || '0' <= ch && ch <= '9') {
      return this.scanNumber();
    }

    if (ch === '"') {
      return this.scanString();
    }

    throw this.createIllegal();
  }

  scanPunctuator() {
    const glyph = this.source.charAt(this.pos++);
    return {
      type: glyph
    };
  }

  scanWord() {
    const start = this.pos;
    this.pos++;

    while (this.pos < this.source.length) {
      let ch = this.source.charAt(this.pos);

      if (ch === '_' || ch === '$' || 'a' <= ch && ch <= 'z' || 'A' <= ch && ch <= 'Z' || '0' <= ch && ch <= '9') {
        this.pos++;
      } else {
        break;
      }
    }

    const value = this.source.slice(start, this.pos);
    return {
      type: this.getKeyword(value),
      value
    };
  }

  scanNumber() {
    const start = this.pos;

    if (this.source.charAt(this.pos) === '-') {
      this.pos++;
    }

    this.skipInteger();

    if (this.source.charAt(this.pos) === '.') {
      this.pos++;
      this.skipInteger();
    }

    let ch = this.source.charAt(this.pos);

    if (ch === 'e' || ch === 'E') {
      this.pos++;
      ch = this.source.charAt(this.pos);

      if (ch === '+' || ch === '-') {
        this.pos++;
      }

      this.skipInteger();
    }

    const value = parseFloat(this.source.slice(start, this.pos));
    return {
      type: _TokenType.TokenType.NUMBER,
      value
    };
  }

  scanString() {
    this.pos++;
    let value = '';

    while (this.pos < this.source.length) {
      let ch = this.source.charAt(this.pos);

      if (ch === '"') {
        this.pos++;
        return {
          type: _TokenType.TokenType.STRING,
          value
        };
      }

      if (ch === '\r' || ch === '\n') {
        break;
      }

      value += ch;
      this.pos++;
    }

    throw this.createIllegal();
  }

  skipInteger() {
    const start = this.pos;

    while (this.pos < this.source.length) {
      let ch = this.source.charAt(this.pos);

      if ('0' <= ch && ch <= '9') {
        this.pos++;
      } else {
        break;
      }
    }

    if (this.pos - start === 0) {
      throw this.createIllegal();
    }
  }

  skipWhitespace() {
    while (this.pos < this.source.length) {
      let ch = this.source.charAt(this.pos);

      if (ch === ' ' || ch === '\t') {
        this.pos++;
      } else if (ch === '\r') {
        this.pos++;

        if (this.source.charAt(this.pos) === '\n') {
          this.pos++;
        }

        this.line++;
        this.lineStart = this.pos;
      } else if (ch === '\n') {
        this.pos++;
        this.line++;
        this.lineStart = this.pos;
      } else {
        break;
      }
    }
  }

  createError(message) {
    return new SyntaxError(message + ` (${this.line}:${this.column})`);
  }

  createIllegal() {
    return this.pos < this.source.length ? this.createError(`Unexpected ${this.source.charAt(this.pos)}`) : this.createError('Unexpected end of input');
  }

  createUnexpected(token) {
    switch (token.type.klass) {
      case _Token.Token.End:
        return this.createError('Unexpected end of input');

      case _Token.Token.NumberLiteral:
        return this.createError('Unexpected number');

      case _Token.Token.StringLiteral:
        return this.createError('Unexpected string');

      case _Token.Token.Identifier:
        return this.createError('Unexpected identifier');

      case _Token.Token.Keyword:
        return this.createError(`Unexpected token ${token.value}`);

      case _Token.Token.Punctuator:
        return this.createError(`Unexpected token ${token.type.name}`);
    }
  }

}

exports.default = Lexer;