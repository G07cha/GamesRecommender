'use strict';

const log = require('./lib/logger');
const { sequelize } = require('./models');
const processUser = require('./lib/process-user');
const CrawlerAPI = require('./lib/crawler-api');
const queue = require('./lib/queue');
const api = require('./lib/api');

api.setQueue(queue);

queue.process(function(job, done) {
  processUser(job.data.id).then(function() {
    done();
  }).catch(function(err) {
    log.error(err);
    done(err)
  });
});

sequelize.authenticate().then(function() {
  return sequelize.sync();
}).then(function () {
  api.start();

  return CrawlerAPI.waitForBoot();
}).catch(log.error);
