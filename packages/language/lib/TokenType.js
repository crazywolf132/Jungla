"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TokenType = void 0;

var _Token = require("./Token.js");

const TokenType = {
  // Special
  END: {
    klass: _Token.Token.End,
    name: 'end'
  },
  IDENTIFIER: {
    klass: _Token.Token.Identifier,
    name: 'identifier'
  },
  NUMBER: {
    klass: _Token.Token.NumberLiteral,
    name: 'number'
  },
  STRING: {
    klass: _Token.Token.StringLiteral,
    name: 'string'
  },
  // Punctuators
  LT: {
    klass: _Token.Token.Punctuator,
    name: '<'
  },
  GT: {
    klass: _Token.Token.Punctuator,
    name: '>'
  },
  LBRACE: {
    klass: _Token.Token.Punctuator,
    name: '{'
  },
  RBRACE: {
    klass: _Token.Token.Punctuator,
    name: '}'
  },
  LPAREN: {
    klass: _Token.Token.Punctuator,
    name: '('
  },
  RPAREN: {
    klass: _Token.Token.Punctuator,
    name: ')'
  },
  LSQUARE: {
    klass: _Token.Token.Punctuator,
    name: '['
  },
  RSQUARE: {
    klass: _Token.Token.Punctuator,
    name: ']'
  },
  COLON: {
    klass: _Token.Token.Punctuator,
    name: ':'
  },
  COMMA: {
    klass: _Token.Token.Punctuator,
    name: ','
  },
  AMP: {
    klass: _Token.Token.Punctuator,
    name: '&'
  },
  AT: {
    klass: _Token.Token.Punctuator,
    name: '@'
  },
  QMARK: {
    klass: _Token.Token.Punctuator,
    name: '?'
  },
  NOT: {
    klass: _Token.Token.Punctuator,
    name: '!'
  },
  HASH: {
    klass: _Token.Token.Punctuator,
    name: '#'
  },
  EQUALS: {
    klass: _Token.Token.Punctuator,
    name: '='
  },
  TILD: {
    klass: _Token.Token.Punctuator,
    name: '~'
  },
  SEMICOLON: {
    klass: _Token.Token.Punctuator,
    name: ';'
  },
  PLUS: {
    klass: _Token.Token.Punctuator,
    name: '+'
  },
  WILD: {
    klass: _Token.Token.Punctuator,
    name: '*'
  },
  CONVERT: {
    klass: _Token.Token.Punctuator,
    name: '->'
  },
  OR: {
    klass: _Token.Token.Punctuator,
    name: '||'
  },
  SLASH: {
    klass: _Token.Token.Punctuator,
    name: '/'
  },
  // Comments
  COMMENT: {
    klass: _Token.Token.Punctuator,
    name: '//'
  },
  BLOCKCOMMENT: {
    klass: _Token.Token.Punctuator,
    name: '/*'
  },
  BLOCKCOMMENTEND: {
    klass: _Token.Token.Punctuator,
    name: '*/'
  },
  // Keywords
  NULL: {
    klass: _Token.Token.Keyword,
    name: 'null'
  },
  TRUE: {
    klass: _Token.Token.Keyword,
    name: 'true'
  },
  FALSE: {
    klass: _Token.Token.Keyword,
    name: 'false'
  },
  AS: {
    klass: _Token.Token.Keyword,
    name: 'as'
  },
  IS: {
    klass: _Token.Token.Keyword,
    name: 'is'
  },
  TYPE_STRING: {
    klass: _Token.Token.Keyword,
    name: 'string'
  },
  TYPE_NUMBER: {
    klass: _Token.Token.Keyword,
    name: 'number'
  },
  TYPE_LIST: {
    klass: _Token.Token.Keyword,
    name: 'list'
  },
  TYPE_LIST_KEYS: {
    klass: _Token.Token.Keyword,
    name: 'list_keys'
  },
  TYPE_OBJ: {
    klass: _Token.Token.Keyword,
    name: 'obj'
  }
};
exports.TokenType = TokenType;