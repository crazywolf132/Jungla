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
    this.result = !Array.isArray(this.data) ? (0, _core.default)(this.ast, this.data) : this.data.map(d => (0, _core.default)(this.ast, d)).filter(i => Object.keys(i).length >= 1).map(this.dive).filter(i => i);
  } // To remove all cases of empty obj's


  dive(obj) {
    const newObj = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];

      if (typeof value === 'object' && Object.keys(value).length >= 1) {
        const deepDiveResult = dive(value);

        if (Object.keys(deepDiveResult).length >= 1) {
          // This means that there are valid children here...
          newObj[key] = deepDiveResult;
        }
      } else if (value !== null && value !== undefined) {
        // We are going to assume that this is some form of value... so we will
        // add it to the list
        newObj[key] = value;
      }
    });
  }

}

exports.default = Interpreter;