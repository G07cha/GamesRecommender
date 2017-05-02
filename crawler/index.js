'use strict';

const config = require('./config');

const cluster = require('cluster');
const { sequelize } = require('./models');
const log = require('console-log-level')(config.log);
const Queue = require('./lib/queue');

const queue = new Queue({
  unique: true
});

function startMaster() {
  const express = require('express');
  const logger = require('morgan');
  const bodyParser = require('body-parser');

  const app = express();

  app.set('queue', queue);
  app.set('env', process.env.NODE_ENV || config.defaultMode);

  app.use(logger(config.logger.type));
  app.use(bodyParser.json(config.bodyParser.json));
  app.use(config.versionPrefix, require('./lib/api'));

  app.set('env', process.env.NODE_ENV || config.defaultMode);

  const server = app.listen(process.env.PORT || config.defaultPort, function() {
    let host = server.address().address,
      port = server.address().port;

    log.info('API running at:', host, port);
  });
}

function startWorker() {
  sequelize.sync().then(function() {
    const Crawler = require('./lib/crawler');
    const crawler = new Crawler(queue);

    // Sample initial point
    crawler.addTask('76561198070651671');
    crawler.start();

    process.on('SIGINT', function() {
      log.warning('Caught interrupt signal');

      crawler.stop().then(function() {
        process.exit();
      });
    });
  });
}

sequelize.authenticate().then(function() {
  if(cluster.isMaster) {
    startMaster();
    cluster.fork();
  } else {
    startWorker();
  }
}).catch(log.error);
