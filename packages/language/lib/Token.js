"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Token = void 0;
const Token = {
  End: {
    name: 'End'
  },
  Punctuator: {
    name: 'Punctuator'
  },
  Keyword: {
    name: 'Keyword'
  },
  Identifier: {
    name: 'Identifier'
  },
  NumberLiteral: {
    name: 'Number'
  },
  StringLiteral: {
    name: 'String'
  }
};
exports.Token = Token;