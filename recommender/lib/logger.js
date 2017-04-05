const logger = require('console-log-level')({
  prefix: function () {
    return new Date().toISOString() + ' [Recommender]'
  },
  level: process.env.LOG || 'info'
});

module.exports = logger;
