"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllFiles = void 0;

var _fs = require("fs");

const getAllFiles = async () => {
  let results = await (0, _fs.readdirSync)(`${process.cwd()}/data/`);
  console.log(results);
  return results;
};

exports.getAllFiles = getAllFiles;