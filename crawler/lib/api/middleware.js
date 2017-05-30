'use strict';

const logger = require('morgan');
const bodyParser = require('body-parser');
const config = require('../../config');

module.exports = {
  connect: function (app) {
    app.use(logger(config.logger.type));
    app.use(bodyParser.json(config.bodyParser.json));
  }
};
