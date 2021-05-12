"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleDefault = exports.handleBasicField = exports.handleCleanBasicField = exports.handleBasicList = exports.handleRegularField = exports.handleControlFlow = exports.handleValue = exports.handleFields = exports.handleRequiredType = exports.handleChildren = exports.handleConvertType = exports.handleList = void 0;

var _hasKey = _interopRequireDefault(require("./hasKey"));

var _cleanList = _interopRequireDefault(require("./cleanList"));

var _shortenList = _interopRequireDefault(require("./shortenList"));

var _meetsParams = _interopRequireDefault(require("./meetsParams"));

var _core2 = _interopRequireDefault(require("./core"));

var _compare = _interopRequireDefault(require("./compare"));

var _listLength = _interopRequireDefault(require("./listLength"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const handleList = (key, field, data) => {
  var _field$alias;

  let name = (_field$alias = field.alias) !== null && _field$alias !== void 0 ? _field$alias : key;
  let result;

  if (Array.isArray(data)) {
    result = (0, _cleanList.default)((0, _shortenList.default)(data, field).filter(child => {
      if ((0, _hasKey.default)(field, 'params')) {
        // Incase we were asked to filter it.
        return (0, _meetsParams.default)(child, field.params);
      }

      return true; // We weren't asked to filter it... so we don't care.
    }));
  } else {
    result = (0, _core2.default)(field.fields, data !== null && data !== void 0 ? data : {});
  }

  return {
    name,
    result
  };
};

exports.handleList = handleList;

const handleConvertType = (key, field, data) => {
  var _field$alias2, _core;

  let name = (_field$alias2 = field.alias) !== null && _field$alias2 !== void 0 ? _field$alias2 : key;
  let children = Object.values((_core = (0, _core2.default)(field, data)) !== null && _core !== void 0 ? _core : {}).filter(i => i); // Just cleaning up the children

  switch (field.toConvert) {
    case 'LIST':
      return {
        name,
        result: children
      };

    case 'LIST_KEYS':
      return {
        name,
        result: Object.keys(children)
      };

    case 'COUNT':
      return {
        name,
        result: Array.isArray(data) ? data.length : 0
      };

    case 'STRING':
    default:
      return {
        name,
        result: (children !== null && children !== void 0 ? children : data).join(' ')
      };
  }
};

exports.handleConvertType = handleConvertType;

const handleChildren = (key, field, data) => {
  var _field$alias3;

  let name = (_field$alias3 = field.alias) !== null && _field$alias3 !== void 0 ? _field$alias3 : key;
  let result;

  if ((0, _hasKey.default)(field, 'params') && (0, _meetsParams.default)(data, field.params) || !(0, _hasKey.default)(field, 'params')) {
    if ((0, _hasKey.default)(field, 'toConvert')) {
      result = handleConvertType(key, field, data).result;
    } else {
      result = (0, _core2.default)(field, data);
    }
  }

  return {
    name,
    result
  };
};

exports.handleChildren = handleChildren;

const handleRequiredType = (key, field, data) => {
  var _field$alias4;

  let name = (_field$alias4 = field.alias) !== null && _field$alias4 !== void 0 ? _field$alias4 : key;
  let result = typeof data === field.RequiredType.value.toLowerCase() ? data : null;
  return {
    name,
    result
  };
};

exports.handleRequiredType = handleRequiredType;

const handleFields = (key, field, data) => {
  return {
    result: (0, _core2.default)(field, data)
  };
};

exports.handleFields = handleFields;

const handleValue = (key, field, data) => {
  var _field$alias5;

  let name = (_field$alias5 = field.alias) !== null && _field$alias5 !== void 0 ? _field$alias5 : key;
  let result = field.value;
  return {
    name,
    result
  };
};

exports.handleValue = handleValue;

const handleControlFlow = (key, field, data) => {
  var _field$alias6;

  let name = (_field$alias6 = field.alias) !== null && _field$alias6 !== void 0 ? _field$alias6 : key;
  let result;

  if ((0, _compare.default)(data[key], field.ifelse._comparator, field.ifelse._check)) {
    if (field.ifelse._if instanceof Object) {
      result = (0, _core2.default)(field.ifelse._if, data);
    } else {
      var _data$field$ifelse$_i;

      result = (_data$field$ifelse$_i = data[field.ifelse._if]) !== null && _data$field$ifelse$_i !== void 0 ? _data$field$ifelse$_i : field.ifelse._if;
    }
  } else {
    if (field.ifelse._else instanceof Object) {
      result = (0, _core2.default)(field.ifelse._else, data);
    } else {
      var _data$field$ifelse$_e;

      result = (_data$field$ifelse$_e = data[field.ifelse._else]) !== null && _data$field$ifelse$_e !== void 0 ? _data$field$ifelse$_e : field.ifelse._else;
    }
  }

  return {
    name,
    result
  };
};

exports.handleControlFlow = handleControlFlow;

const handleRegularField = (key, field, data) => {
  return {
    result: field.value ? field.value : field.fields ? (0, _core2.default)(field.fields, data) : field
  };
};

exports.handleRegularField = handleRegularField;

const handleBasicList = (key, field, data) => {
  return {
    result: (0, _listLength.default)(field, data.filter(item => (0, _hasKey.default)(field, 'params') ? (0, _meetsParams.default)(item, field.params) ? true : false : true).filter(d => {
      if ((0, _hasKey.default)(field, 'fields')) {
        return (0, _core2.default)(field.fields, d);
      } else return d;
    })).filter(i => i) // This will remove null results,

  };
};

exports.handleBasicList = handleBasicList;

const handleCleanBasicField = (key, field, data) => {
  let final = data;

  if ((0, _hasKey.default)(field, 'sizeLimit')) {
    final = (0, _listLength.default)(field, final);
  }

  if ((0, _hasKey.default)(field, 'add')) {
    final = `${final}${field.add.value}`;
  }

  return {
    result: final
  };
};

exports.handleCleanBasicField = handleCleanBasicField;

const handleBasicField = (key, field, data) => {
  let result = undefined;

  if (Array.isArray(data)) {
    if (data.length >= 1) {
      result = handleBasicList(key, field, data).result;
    } else if (field.defaultValue !== undefined) {
      result = handleRegularField(key, field.defaultValue, data).result;
    }
  } else {
    if (data != undefined) {
      result = handleCleanBasicField(key, field, data).result;
    } else if (field.defaultValue !== undefined) {
      result = handleRegularField(key, field, data).result;
    }
  }

  return {
    result
  };
};

exports.handleBasicField = handleBasicField;

const handleDefault = (key, field, data) => {
  let name;
  let result; // Checking to see if we are working with an array.

  if (Array.isArray(field)) {
    field.map(child => {
      // TODO: try and send it back throught the compiler instead of copy and paste of code.
      if ((0, _hasKey.default)(child, 'fields')) {
        var _data$key;

        let children = handleChildren(child, (_data$key = data[key]) !== null && _data$key !== void 0 ? _data$key : data).result;

        if (result == undefined) {
          result = [{
            name: child.alias,
            result: children
          }];
        } else {
          result = [...result, {
            name: child.alias,
            result: children
          }];
        }
      } else {
        if (result == undefined) {
          result = [{
            name: child.alias,
            result: handleBasicField(key, child, data[key] == undefined ? null : data[key]).result
          }];
        } else {
          result = [...result, {
            name: child.alias,
            result: handleBasicField(key, child, data[key] == undefined ? null : data[key]).result
          }];
        }
      }
    });
  } else {
    if ((0, _hasKey.default)(field, 'params') && (0, _meetsParams.default)(data, field.params) || !(0, _hasKey.default)(field, 'params')) {
      var _field$alias7;

      name = (_field$alias7 = field.alias) !== null && _field$alias7 !== void 0 ? _field$alias7 : key;
      result = handleBasicField(key, field, data[key] == undefined ? null : data[key]).result;
    } else {
      name = null;
      result = null;
    }
  }

  return {
    name,
    result
  };
};

exports.handleDefault = handleDefault;