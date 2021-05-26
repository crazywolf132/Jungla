"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.mimic = exports.enableDataRoute = exports.defaultCors = void 0;

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

app.use((0, _bodyParser.json)({
  limit: '50mb'
}));
app.use((0, _bodyParser.urlencoded)({
  extended: true
}));
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

const defaultCors = () => {
  const corsOptions = {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    optionsSuccessStatus: 200,
    // some legacy browsers (IE11, various SmartTVs) choke on 204
    'Access-Control-Expose-Headers': '*'
  };
  app.use('*', (0, _cors.default)(corsOptions));
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Expose-Headers', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });
};

exports.defaultCors = defaultCors;

const enableDataRoute = () => {
  app.use('/', _basicRoute.default);
};

exports.enableDataRoute = enableDataRoute;

const mimic = (websiteURL, routeName, options = {}) => {
  const router = (0, _express.Router)();
  router.all('/*', async (req, res) => {
    const {
      method,
      body: requestBody,
      headers: oldHeaders
    } = req;
    const {
      operationName
    } = requestBody;
    const additionalHeaders = {};

    if (options.copyHeaders) {
      options.copyHeaders.forEach(header => {
        var _req$headers$header;

        additionalHeaders[header] = JSON.stringify((_req$headers$header = req.headers[header]) !== null && _req$headers$header !== void 0 ? _req$headers$header : {});
      });
    } // We are going to determine if this is a real `post` (just an example) request
    // or a JUNGLA request.


    const realRequest = Object.keys(requestBody).length >= 1 && !Object.keys(requestBody).includes('query') || Object.keys(requestBody).length === 0;

    try {
      const response = await (0, _nodeFetch.default)(`${websiteURL}${req.params['0']}`, {
        method: realRequest ? method : 'get',
        body: realRequest && Object.keys(requestBody).length >= 1 ? JSON.stringify(requestBody) : undefined,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          ...additionalHeaders
        }
      });

      if (response.status !== 200) {
        return res.status(response.status).end(response.statusText);
      }

      let body;

      if (response.headers.get('content-type').includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.buffer();
      }

      if (operationName !== null && operationName == 'IntrospectionQuery') {
        return res.json({
          data: (0, _introspection.default)(body[0])
        });
      }

      const tempHeaders = {};
      const responseHeaders = response.headers.raw();
      Object.keys(responseHeaders).forEach(headerKey => {
        const val = responseHeaders[headerKey];
        tempHeaders[headerKey] = Array.isArray(val) ? val[0] : val;
      });
      res.set({ ...tempHeaders
      }); // res.set('content-type', response.headers.get('content-type'));
      // Only going to bother with the JUNGLA part if the response is json... otherwise it is pointless wasting time

      if (response.headers.get('content-type').includes('application/json')) {
        var _body;

        res.json((0, _language.default)(req.body.query || '{}', (_body = body) !== null && _body !== void 0 ? _body : {}));
      } else {
        res.end(body);
      }
    } catch {}
  });
  app.use(routeName, router);
};

exports.mimic = mimic;
var _default = app;
exports.default = _default;