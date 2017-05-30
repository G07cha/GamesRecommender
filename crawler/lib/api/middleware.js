'use strict';

const config = require('../../config');
const logger = require('morgan');
const bodyParser = require('body-parser');
const errorHandler = require('./error-handler');

module.exports = {
  connect: function (app) {
    app.use(logger(config.logger.type));
    app.use(bodyParser.json(config.bodyParser.json));
    app.use(errorHandler);
  }
};
