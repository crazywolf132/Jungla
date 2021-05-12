"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _compare = _interopRequireDefault(require("./compare"));

var _lodash = require("lodash");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (data, conditions) => {
  let requiredCount = conditions.length;
  let found = 0;
  conditions.forEach(condition => {
    // If condition.name is a list  ... we need to check each name against the values,
    // and see if the at least one matches....
    if (Array.isArray(condition.name)) {
      // It's 1 because it is an OR statement. So only 1 must be true.
      let newCount = 1;
      let newFound = 0;

      if (Array.isArray(condition.value)) {
        // If we also have multiple values... check them both at the same time.
        condition.name.forEach(n => {
          condition.value.forEach(v => {
            if ((0, _compare.default)((0, _lodash.get)(data, n), condition.condition, v)) {
              newFound++;
            }
          });
        });
      } else {
        condition.name.forEach(n => {
          if ((0, _compare.default)((0, _lodash.get)(data, n), condition.condition, condition.value)) {
            newFound++;
          }
        });
      }

      if (newFound >= newCount) return found++;
    } else if (Array.isArray(condition.value)) {
      // if the values is a list... we need to check to see if at least 1 matches.
      let newCount = 1;
      let newFound = 0;
      condition.value.forEach(v => {
        if ((0, _compare.default)((0, _lodash.get)(data, condition.name), condition.condition, v)) {
          newFound++;
        }
      });
      if (newFound >= newCount) found++;
    }

    if ((0, _compare.default)((0, _lodash.get)(data, condition.name), condition.condition, condition.value)) found++;
  });
  return requiredCount === found;
};

exports.default = _default;