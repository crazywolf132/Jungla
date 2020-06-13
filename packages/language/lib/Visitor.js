"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.traverse = exports.default = exports.nameSymbol = exports.rootSymbol = void 0;

var _ = _interopRequireWildcard(require("lodash"));

var _utils = require("./utils");

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const rootSymbol = '@@root';
exports.rootSymbol = rootSymbol;
const nameSymbol = '@@name';
exports.nameSymbol = nameSymbol;

class TaggedTemplateVisitor {
  constructor(params, quasis) {
    this.params = params || {};
    this.quasis = quasis || {};
  }

  transformFields(fields) {
    const obj = {};
    fields.forEach(f => {
      if (f.hasOwnProperty(rootSymbol)) {
        for (let field in f) {
          obj[field] = f[field];
        }
      } else {
        obj[f[nameSymbol]] = f;
      }
    });
    return obj;
  }

  Query(node) {
    const query = this.transformFields(node.fields);
    Object.defineProperty(query, rootSymbol, {
      value: true
    });
    return query;
  }

  Field(node) {
    const field = {};
    Object.defineProperty(field, nameSymbol, {
      value: node.name
    });

    if (node.alias) {
      field.alias = node.alias;
    }

    if (node.params) {
      field.params = node.params;
    }

    if (node.toConvert) {
      field.toConvert = node.toConvert;
    }

    if (node.defaultValue) {
      field.defaultValue = node.defaultValue;
    }

    if (node.RequiredType) {
      field.RequiredType = node.RequiredType;
    }

    if (node.fields.length > 0) {
      field.fields = this.transformFields(node.fields);
    } else if (node._fromIf) {
      return this.transformFields([node]);
    }

    return field;
  }

  Literal(node) {
    return node.value;
  }

  Reference(node) {
    let field = this.quasis[node.name];

    if (node.alias) {
      field.alias = node.alias;
    }

    return field;
  }

  Variable(node) {
    return this.params[node.name];
  }

  Var(node) {
    const field = {};
    Object.defineProperty(field, nameSymbol, {
      value: node.name
    });

    if (node.fields.length > 0) {
      // Adding nameSymbol to each... as it isnt there.
      field.fields = this.transformFields(node.fields);
    }

    if (node.ifelse) {
      let _if = node.ifelse._if[0];
      let _if_name = _if.name;
      let _else = node.ifelse._else[0];
      let _else_name = _else.name;
      let result = {
        _comparitor: node.ifelse.comparitor,
        _check: node.ifelse._check,
        _if: node.ifelse._if[0] instanceof Object && node.ifelse._if[0].type ? this[node.ifelse._if[0].type](node.ifelse._if[0], true) : node.ifelse._if,
        _else: node.ifelse._else[0] instanceof Object && node.ifelse._else[0].type ? this[node.ifelse._else[0].type](node.ifelse._else[0], true) : node.ifelse._else
      };
      field.ifelse = result;
    }

    let dupe = _.clone(field);

    Object.defineProperty(dupe, nameSymbol, {
      value: node.name
    }); // return field;

    this.quasis[node.name] = dupe;

    if (node.isVar) {
      field.isVar = node.isVar;
    }

    return field;
  }

  List(node) {
    const field = {
      isList: true
    };
    Object.defineProperty(field, nameSymbol, {
      value: node.name
    });

    if (node.fields.length > 0) {
      field.fields = this.transformFields(node.fields);
    }

    if (node.sizeLimit) {
      field.sizeLimit = node.sizeLimit;
    }

    if (node.alias) {
      field.alias = node.alias;
    }

    return field;
  }

}

exports.default = TaggedTemplateVisitor;

const traverse = (parsed, visitor = new TaggedTemplateVisitor(null, null), isArray = true) => {
  if (Array.isArray(parsed)) {
    return parsed.map(node => travel(node, visitor));
  } else {
    return travel(parsed, visitor);
  }
};

exports.traverse = traverse;

const travel = (node, visitor) => {
  if (!node) {
    return node;
  } // Duplicate the node to avoid mutations


  node = { ...node
  };
  const type = node.type;

  switch (type) {
    case 'Query':
      node.fields = node.fields.map(n => traverse(n, visitor, false));
      break;

    case 'Field':
      node.fields = node.fields.map(n => traverse(n, visitor, false));
      break;

    case 'Var':
      node.fields = node.fields.map(n => traverse(n, visitor, false));
      break;

    case 'List':
      node.fields = node.listFields.map(n => traverse(n, visitor, false));
      break;
  } // Check to see if the visitor class provided has a function
  // for the type provided.


  if (typeof visitor[type] === 'function') {
    const repl = visitor[type](node);

    if (repl !== void 0) {
      node = repl;
    }
  }

  return node;
};