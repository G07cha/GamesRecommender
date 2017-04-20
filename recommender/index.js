'use strict';


const log = require('./lib/logger');
const { sequelize } = require('./models');
const processUser = require('./lib/process-user');
const CrawlerAPI = require('./lib/crawler-api');
const queue = require('./lib/queue');

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
  queue.getPending();
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
