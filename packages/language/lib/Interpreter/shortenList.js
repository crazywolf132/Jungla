"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = _interopRequireDefault(require("./core"));

var _hasKey = _interopRequireDefault(require("./hasKey"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (data, field) => {
  return data.map((d, index) => {
    var _field$sizeLimit;

    if ((0, _hasKey.default)(field, 'sizeLimit') && Array.isArray(field.sizeLimit)) {
      const [start, finish] = field.sizeLimit;

      if (index + 1 >= start && index + 1 <= (finish !== null && finish !== void 0 ? finish : data.length)) {
        return (0, _core.default)(field.fields, d);
      } else return null;
    }

    if (index + 1 <= ((_field$sizeLimit = field.sizeLimit) !== null && _field$sizeLimit !== void 0 ? _field$sizeLimit : data.length)) return (0, _core.default)(field.fields, d);else return null;
  }).filter(i => i); // Do this to remove empty objects...
};

exports.default = _default;