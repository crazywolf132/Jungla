"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hasKey = _interopRequireDefault(require("./hasKey"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (field, data) => {
  if (Array.isArray(data) && (0, _hasKey.default)(field, 'sizeLimit')) {
    if (Array.isArray(field.sizeLimit)) {
      let [start, finish] = field.sizeLimit;

      if (String(finish) === '...') {
        finish = data.length + 1;
      }

      return data.slice(start - 1, finish - 1);
    } else {
      final = data.slice(0, field.sizeLimit);
    }
  }

  return data;
};

exports.default = _default;