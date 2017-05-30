'use strict';

const config = require('../../config');
const logger = require('morgan');
const errorHandler = require('./error-handler');

module.exports = {
  connect: function (app) {
    app.use(logger(config.logger.type));
    app.use(errorHandler);
  }
};
