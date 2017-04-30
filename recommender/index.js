'use strict';

const log = require('./lib/logger');
const { sequelize } = require('./models');
const processUser = require('./lib/process-user');
const CrawlerAPI = require('./lib/crawler-api');
const queue = require('./lib/queue');
const config = require('./config');
const express = require('express');
const logger = require('morgan');

const app = express();

app.set('env', process.env.MODE || config.defaultMode);
app.set('queue', queue);

app.use(logger(config.logger.type));
app.use(config.versionPrefix, require('./lib/api'));


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
  let server = app.listen(process.env.PORT || config.defaultPort, function() {
    let host = server.address().address,
      port = server.address().port;

    log.info('API running at:', host, port);
  });

  return queue.getPending();
}).then(function(currentQueue) {
  if(currentQueue) {
    return [];
  }

  return CrawlerAPI.getUserList();
}).then(function(users) {
  let ids = users.map((user) => user.id);

  ids.forEach(function(id) {
    queue.create({
      title: 'Processing ' + id,
      id
    });
  });
}).catch(log.error);
