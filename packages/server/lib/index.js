"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Server", {
  enumerable: true,
  get: function () {
    return _server.default;
  }
});
Object.defineProperty(exports, "mimic", {
  enumerable: true,
  get: function () {
    return _server.mimic;
  }
});
Object.defineProperty(exports, "Middleware", {
  enumerable: true,
  get: function () {
    return _middleware.default;
  }
});
exports.Converter = void 0;

var _language = _interopRequireDefault(require("../language"));

var _server = _interopRequireWildcard(require("./server"));

var _middleware = _interopRequireDefault(require("./handlers/middleware"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const Converter = (req, res, next) => {
  if (!req.header.useJungla) {
    return res.status(501).json({
      status: 'Failed',
      middlewareUsed: false,
      converterUsed: true,
      message: 'Please use the Jungla Middleware before this middleware.'
    });
  }

  const old = res.json;

  res.json = function (obj) {
    obj = (0, _language.default)(req.body.query, obj);
    old.call(this, obj);
  };

  next();
};

exports.Converter = Converter;