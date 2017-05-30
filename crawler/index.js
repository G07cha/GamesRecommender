'use strict';

const config = require('./config');

const { sequelize } = require('./models');
const log = require('console-log-level')(config.log);
const Queue = require('./lib/queue');
const api = require('./lib/api');

const queue = new Queue({
  unique: true
});

api.setQueue(queue);

sequelize.authenticate().then(function() {
  api.start();

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
}).catch(log.error);
