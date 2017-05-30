'use strict';

const config = require('../../config');
const log = require('console-log-level')(config.log);

module.exports = function errorHandler(err, req, res, next) {
  if(!err) {
    next();
  } else {
    res.status(err.statusCode || 500);
    log.error('Error occured for', req.method, req.path);
    log.error(err);

    res.json({
      type: err.constructor.name,
      code: err.code,
      message: err.message || 'Something went wrong'
    });
  }
};
