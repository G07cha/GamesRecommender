const logger = require('console-log-level')({
  prefix: function () {
    return new Date().toISOString() + ' [UI]'
  },
  level: process.env.LOG || 'info'
});

module.exports = logger;
