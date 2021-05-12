"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hasKey = _interopRequireDefault(require("./hasKey"));

var handlers = _interopRequireWildcard(require("./handlers"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (tree, data) => {
  let obj = {};
  if (Object.keys(tree).length === 0) return data; // This means the tree is at the end...

  Object.keys(tree).forEach(key => {
    var _data$key, _data$key2;

    const val = tree[key];

    if (!val.isVar) {
      // This is so then we don't print out vars...
      switch (true) {
        case (0, _hasKey.default)(val, 'isList'):
          // We are dealing with a list of data objects
          let listResult = handlers.handleList(key, val, data[key]);
          obj[listResult.name] = listResult.result;
          break;

        case (0, _hasKey.default)(val, 'fields'):
          // This means we are dealing with a data object
          let childrenResult = handlers.handleChildren(key, val, (_data$key = data[key]) !== null && _data$key !== void 0 ? _data$key : data);
          obj[childrenResult.name] = childrenResult.result;
          break;

        case (0, _hasKey.default)(val, 'RequiredType'):
          // This means we will only do this value, if their types match
          let requiredResult = handlers.handleRequiredType(key, val, data[key]);
          obj[requiredResult.name] = requiredResult.result;
          break;

        case (0, _hasKey.default)(val, 'value'):
          // This means that we have been given a value to use...
          let valueResult = handlers.handleValue(key, val, data);
          obj[valueResult.name] = valueResult.result;
          break;

        case (0, _hasKey.default)(val, 'ifelse'):
          // This means we are dealing with a control-flow statement
          let ifelseResult = handlers.handleControlFlow(key, val, data);
          obj[ifelseResult.name] = ifelseResult.result;
          break;

        case (0, _hasKey.default)(val, 'toConvert'):
          // This means we are dealing with converting the values to something else.
          let convertResult = handlers.handleConvertType(key, val, (_data$key2 = data[key]) !== null && _data$key2 !== void 0 ? _data$key2 : data);
          obj[convertResult.name] = convertResult.result;
          break;

        case key === 'fields':
          // This means we are already inside the data-object
          // I don't even remember what this part does.
          let basicResult = handlers.handleFields(key, val, data);
          obj = basicResult.result;
          break;

        default:
          // This is just a basic list of the fields we want... or a single field.
          let defaultResult = handlers.handleDefault(key, val, data);

          if (Array.isArray(defaultResult.result) && defaultResult.name == undefined) {
            // This means that we dealt with a list rather than a single item...
            // This list should be formatted to contain { result, name } objects... so we will just link
            // them to the obj
            defaultResult.result.forEach(child => {
              // console.log({ child });
              obj[defaultResult.name] = child;
            });
          } else {
            if (defaultResult.name !== null && defaultResult.result !== null) obj[defaultResult.name] = defaultResult.result;
          }

      }
    }
  });
  return obj;
};

exports.default = _default;