"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _default = (obj1, comparator, obj2) => {
  obj1 = obj1 === 'true' ? true : obj1 === 'false' ? false : obj1;
  obj2 = obj2 === 'true' ? true : obj2 === 'false' ? false : obj2;

  switch (comparator) {
    case '>':
      return obj1 >= obj2;

    case '<':
      return obj1 <= obj2;

    case '!':
      return obj1 != obj2;

    case '*':
      return String(obj1).includes(String(obj2));

    case '=':
    default:
      return obj1 === obj2;
  }
};

exports.default = _default;