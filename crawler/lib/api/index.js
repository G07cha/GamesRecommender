'use strict';

const config = require('../../config');
const express = require('express');
const log = require('console-log-level')(config.log);
const middleware = require('./middleware');

const app = express();

middleware.connect(app);

app.set('env', process.env.NODE_ENV || config.defaultMode);
app.use(config.versionPrefix, require('./controllers'));

module.exports = {
  setQueue: function (queue) {
    app.set('queue', queue);
  },
  start: function () {
    const server = app.listen(process.env.PORT || config.defaultPort, function() {
      let host = server.address().address,
        port = server.address().port;

      log.info('API running at:', host, port);
    });
  }
};
