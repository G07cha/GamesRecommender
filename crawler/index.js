'use strict';

const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser');
const Crawler = require('./lib/crawler');
const { sequelize } = require('./models');
const log = require('console-log-level')(config.log);

const crawler = new Crawler();
const app = express();

app.set('crawler', crawler);
app.set('env', process.env.NODE_ENV || config.defaultMode);

app.use(bodyParser.json(config.bodyParser.json));
app.use(config.versionPrefix, require('./lib/api'));

sequelize.authenticate().then(function() {
  return sequelize.sync();
}).then(function() {
  log.info('Crawler is started');

  // Sample initial point
  crawler.addTask('76561198070651671');
  crawler.start();
  let server = app.listen(process.env.PORT || config.defaultPort, function() {
    let host = server.address().address,
      port = server.address().port;

    log.info('API running at:', host, port);
  });
}).catch(log.error);

process.on('SIGINT', function() {
  log.warning('Caught interrupt signal');

  crawler.stop().then(function() {
    process.exit();
  });
});
