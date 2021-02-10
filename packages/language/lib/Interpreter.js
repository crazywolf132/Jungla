"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Interpreter {
  constructor(ast, data) {
    this.ast = ast;
    this.data = data;
    this.result = !Array.isArray(this.data) ? this.compile(this.ast, this.data) : this.data.map(d => this.compile(this.ast, d));
  }

  meetsParams(data, params) {
    let requiredCount = params.length;
    let found = 0;
    params.forEach(p => {
      // If p.name is a list... we need to check each name against the values, and see if atleast one matches.
      if (Array.isArray(p.name)) {
        // Its 1 because it is an OR statement. So only 1 must be true.
        let newCount = 1;
        let newFound = 0;

        if (Array.isArray(p.value)) {
          // If we also have multiple values... check them both at the same time.
          p.name.forEach(n => {
            p.value.forEach(v => {
              if (this.compare2(data[n], p.condition, v)) newFound++;
            });
          });
        } else {
          p.name.forEach(n => {
            if (this.compare2(data[n], p.condition, p.value)) newFound++;
          });
        }

        if (newFound >= newCount) return found++;
      } else if (Array.isArray(p.value)) {
        // if the values is a list... we need to check to see if atleast 1 matches.
        let newCount = 1;
        let newFound = 0;
        p.value.forEach(v => {
          if (this.compare2(data[p.name], p.condition, v)) {
            newFound++;
          }
        });
        if (newFound >= newCount) found++;
      }

      if (this.compare2(data[p.name], p.condition, p.value)) found++;
    });
    return requiredCount === found;
  }

  compile(ast, data) {
    let obj = {};
    if (Object.keys(ast).length === 0) return data;
    Object.keys(ast).forEach(key => {
      if (!ast[key].isVar) {
        // We can actually add this to our object...
        if (this.hasKey(ast[key], 'isList')) {
          obj[ast[key].alias || key] = this.listType(data[key], ast[key]);
        } else if (this.hasKey(ast[key], 'fields')) {
          let children = this.handleChildren(ast[key], data[key] || data); // console.log('key ::: ', key);

          if (children != undefined) obj[ast[key].alias || key] = children;
        } else if (this.hasKey(ast[key], 'RequiredType')) {
          obj[ast[key].alias || key] = this.requiredType(data[key], ast[key]);
        } else if (key === 'fields') {
          // We need to go into this object, and get its objects...
          obj = this.compile(ast[key], data);
        } else if (this.hasKey(ast[key], 'value')) {
          obj[ast[key].alias || key] = ast[key].value;
        } else if (this.hasKey(ast[key], 'ifelse')) {
          // performing the ifstatement our self.
          obj[ast[key].alias || key] = this.flowControl(data, key, ast[key]);
        } else if (this.hasKey(ast[key], 'toConvert')) {
          // Converting the data, then assigning it to the key
          obj[ast[key].alias || key] = this.convertToType(data[key] || data, ast[key]);
        } else {
          if (Array.isArray(ast[key])) {
            ast[key].map(subItem => {
              // TODO : try and send it back through the compiler instead of copy and paste of code.
              if (this.hasKey(subItem, 'fields')) {
                let children = this.handleChildren(subItem, data[key] || data);
                obj[subItem.alias] = children;
              } else {
                obj[subItem.alias] = this.basicField(data[key] == undefined ? null : data[key], subItem, data);
              }
            });
          } else {
            // We are just treating this like a regular data retrieval
            obj[ast[key].alias || key] = this.basicField(data[key] == undefined ? null : data[key], ast[key], data);
          }
        }
      }
    });
    return obj;
  }

  requiredType(data, field) {
    return typeof data === field.RequiredType.value.toLowerCase() ? data : null;
  }

  listType(data, field) {
    return Array.isArray(data) ? this.cleanList(this.shortenList(data, field).filter(item => {
      if (this.hasKey(field, 'params')) {
        return this.meetsParams(item, field.params);
      }

      return true;
    })) : this.compile(field.fields, data || {});
  }

  shortenList(data, field) {
    return data.map((d, index) => {
      // TODO... check if sizeLimit is an array... if it is, we need to create an offset to start from...
      if (index + 1 <= (field.sizeLimit || data.length)) return this.compile(field.fields, d);else return null;
    });
  }

  handleChildren(key, data) {
    if (this.hasKey(key, 'params') && this.meetsParams(data, key.params) || !this.hasKey(key, 'params')) {
      if (this.hasKey(key, 'toConvert')) {
        return this.convertToType(data, key);
      } else {
        return this.compile(key, data);
      }
    }
  }

  flowControl(data, key, field) {
    return this.compare2(data[key], field.ifelse._comparator, field.ifelse._check) ? field.ifelse._if instanceof Object ? this.compile(field.ifelse._if, data) : data[field.ifelse._if] || field.ifelse._if : field.ifelse._else instanceof Object ? this.compile(field.ifelse._else, data) : data[field.ifelse._else] || field.ifelse._else;
  }

  convertToType(data, field) {
    let children = Object.values(this.compile(field, data)).filter(i => i != undefined); // console.log({ children, data });

    return field.toConvert === 'LIST' ? children : field.toConvert === 'LIST_KEYS' ? Object.keys(data) : field.toConvert === 'COUNT' ? Array.isArray(data) ? data.length : 0 : (children !== null && children !== void 0 ? children : data).join(' ');
  }

  basicField(data, field, dataAll) {
    // console.log(field);
    if (Array.isArray(data)) {
      return data.length >= 1 ? this.basicList(data, field) : field.defaultValue !== undefined ? this.default(field.defaultValue, data) : undefined;
    }

    return data != undefined ? this.cleanBasicField(data, field) : field.defaultValue !== undefined ? this.default(field.defaultValue, data) : undefined;
  }

  basicList(data, field) {
    // This is used to modify a list value, that doesnt have a set structure

    /**
     * EG:
     * categories <1>
     * INSTEAD OF
     * categories : <1> {blah, blah}
     */
    return data.filter(item => this.hasKey(field, 'params') ? this.meetsParams(item, field.params) ? true : false : true).filter((d, index) => {
      // TODO... check if sizeLimit is an array... if it is, we need to create an offset to start from...
      return index + 1 <= (field.sizeLimit || data.length);
    });
  }

  default(field, data) {
    field = field.value ? field.value : field.fields ? this.compile(field.fields, data) : field;
    return field;
  }

  cleanBasicField(data, field) {
    // console.log('RUNNING BASIC ::: ', field);
    let final = data;

    if (field.sizeLimit) {
      if (Array.isArray(field.sizeLimit)) {
        final = data.slice(field.sizeLimit[0], field.sizeLimit[1]);
      } else {
        final = data.slice(0, field.sizeLimit);
      }
    }

    if (field.add) {
      final = `${final}${field.add.value}`;
    }

    return final;
  }

  hasKey(obj, keyName) {
    return obj.hasOwnProperty(keyName);
  }

  cleanList(data) {
    return _lodash.default.compact(data);
  }

  compare2(obj1, comparator, obj2) {
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
  }

}

exports.default = Interpreter;