"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");

var _files = require("../handlers/files");

var _middleware = _interopRequireDefault(require("../handlers/middleware"));

var _language = _interopRequireDefault(require("../../language"));

var _introspection = _interopRequireDefault(require("../handlers/introspection"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This route will be used to access the data in the current working directory.
 *
 * This will mean a user can run the server version of jungla in a folder, and everything
 * in there will be served and accessable.
 */
const router = (0, _express.Router)();

const getFileByName = async (req, res) => {
  const {
    useJungla
  } = req.header;
  const {
    fileName: name
  } = req.params;
  const data = await ((await (0, _files.getAllFiles)()).map(item => item.replace('.json', '')).includes(name) ? require(`${process.cwd()}/data/${name}.json`) : {
    error: 'NOTHING FOUND WITH THIS NAME'
  });
  res.json(useJungla ? (0, _language.default)(req.body.query, data) : data);
};

const getAllFilesIndex = async (req, res) => {
  const {
    useJungla
  } = req.header;
  const data = (await (0, _files.getAllFiles)()).map(item => item.replace('.json', ''));
  res.json(useJungla ? (0, _language.default)(req.body.query, data) : data);
};

router.get('/', getAllFilesIndex);
router.post('/', _middleware.default, getAllFilesIndex);
router.get('/introspection', (req, res) => {
  let intro = (0, _introspection.default)(require('../../../data/todos.json')[0]);
  res.json({
    data: intro
  });
});
router.get('/:fileName', getFileByName);
router.post('/:fileName', _middleware.default, getFileByName);
var _default = router;
exports.default = _default;