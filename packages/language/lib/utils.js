"use strict";

const utils = module.exports = {};
const log = console.log;

const util = require('util');

const inspect = data => util.inspect(data, false, null, true
/* enable colors */
);

utils.log = data => {
  log(inspect(data));
};