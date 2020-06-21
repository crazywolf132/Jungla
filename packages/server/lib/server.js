"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.mimic = exports.enableDataRoute = void 0;

var _express = _interopRequireWildcard(require("express"));

var _morgan = _interopRequireDefault(require("morgan"));

var _expressTimeoutHandler = _interopRequireDefault(require("express-timeout-handler"));

var _bodyParser = require("body-parser");

var _cors = _interopRequireDefault(require("cors"));

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _language = _interopRequireDefault(require("@jungla/language"));

var _introspection = _interopRequireDefault(require("./handlers/introspection"));

var _basicRoute = _interopRequireDefault(require("./routes/basicRoute"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

/*
 
 ███████╗███████╗████████╗██╗   ██╗██████╗ 
 ██╔════╝██╔════╝╚══██╔══╝██║   ██║██╔══██╗
 ███████╗█████╗     ██║   ██║   ██║██████╔╝
 ╚════██║██╔══╝     ██║   ██║   ██║██╔═══╝ 
 ███████║███████╗   ██║   ╚██████╔╝██║     
 ╚══════╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝     
                                           
 
*/
const app = (0, _express.default)();

if (process.env.NODE_ENV !== 'test') {
  app.use((0, _morgan.default)('dev'));
}

const corsOptions = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  optionsSuccessStatus: 200,
  // some legacy browsers (IE11, various SmartTVs) choke on 204
  'Access-Control-Expose-Headers': '*'
};
app.use((0, _bodyParser.json)());
app.use((0, _bodyParser.urlencoded)({
  extended: true
}));
app.use('*', (0, _cors.default)(corsOptions));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Expose-Headers', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(_expressTimeoutHandler.default.handler({
  timeout: 60000,
  onTimeout: function (req, res) {
    res.status(503).send('Request timeout. Please retry again later');
  }
}));
/*
 
 ██████╗  ██████╗ ██╗   ██╗████████╗███████╗███████╗
 ██╔══██╗██╔═══██╗██║   ██║╚══██╔══╝██╔════╝██╔════╝
 ██████╔╝██║   ██║██║   ██║   ██║   █████╗  ███████╗
 ██╔══██╗██║   ██║██║   ██║   ██║   ██╔══╝  ╚════██║
 ██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗███████║
 ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚══════╝
                                                    
 
*/

const enableDataRoute = () => {
  app.use('/', _basicRoute.default);
};

exports.enableDataRoute = enableDataRoute;

const mimic = (websiteURL, routeName) => {
  const router = (0, _express.Router)();
  router.get('/*', (req, res) => {
    (0, _nodeFetch.default)(`${websiteURL}${req.params['0']}`).then(res => res.json()).then(body => {
      if (operationName !== null && operationName == 'IntrospectionQuery') {
        return res.json({
          data: (0, _introspection.default)(body[0])
        });
      }

      res.json((0, _language.default)(req.body.query || '{}', body));
    });
  });
  router.post('/*', (req, res) => {
    const {
      operationName
    } = req.body;
    (0, _nodeFetch.default)(`${websiteURL}${req.params['0']}`).then(res => res.json()).then(body => {
      if (operationName !== null && operationName == 'IntrospectionQuery') {
        return res.json({
          data: (0, _introspection.default)(body[0])
        });
      }

      res.json((0, _language.default)(req.body.query || '{}', body));
    });
  });
  app.use(routeName, router);
};

exports.mimic = mimic;
var _default = app;
exports.default = _default;