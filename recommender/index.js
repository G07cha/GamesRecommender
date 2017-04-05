'use strict';

const kue = require('kue');

const log = require('./lib/logger');
const { sequelize, User } = require('./shared/models');
const processUser = require('./lib/process-user');

let queue = kue.createQueue({
  redis: {
    port: process.env.REDIS_PORT_6379_TCP_PORT,
    host: process.env.REDIS_PORT_6379_TCP_ADDR
  }
});

queue.process('recommendation', function(job, done) {
  processUser(job.data.id).then(function() {
    done();
  }).catch(function(err) {
    log.error(err);
    done(err)
  });
});

queue.on('error', log.error);

process.once('SIGTERM', function () {
  queue.shutdown(60000, function(err = '') {
    log.info('Queue shutdown: ', err);
    process.exit(0);
  });
});

sequelize.authenticate().then(function() {
  if(process.env.DASHBOARD_PORT) {
    log.info('Dashboard available at:', process.env.DASHBOARD_PORT)
    kue.app.listen(process.env.DASHBOARD_PORT);
    kue.app.set('title', 'Recommender');
  }

  return new Promise(function(resolve, reject) {
    queue.inactiveCount(function(err, total) {
      if(err) return reject(err);

      resolve(total);
    });
  });
}).then(function(currentQueue) {
  if(currentQueue) {
    return [];
  }

  return User.findAll({
    where: { id: 1 }
    // having: ['COUNT("Recommendations".id) = 0'],
    // group: ['User.id', 'Recommendations.id'],
    // include: [Recommendation]
  });
}).then(function(users) {
  users.forEach(function(user) {
    queue.create('recommendation', {
      title: 'Processing ' + user.id,
      id: user.id
    }).priority('low').save();
  });
}).catch(log.error);
