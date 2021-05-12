"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _core = _interopRequireDefault(require("./core"));

var _utils = require("../utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Interpreter {
  constructor(ast, data) {
    this.ast = ast;
    this.data = data;
    this.result = !Array.isArray(this.data) ? (0, _core.default)(this.ast, this.data) : this.data.map(d => (0, _core.default)(this.ast, d)).filter(i => Object.keys(i).length >= 1);
  }

}

exports.default = Interpreter;