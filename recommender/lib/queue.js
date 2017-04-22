const kue = require('kue');
const log = require('./logger');

const JOB_NAME = 'recommendation';

let queue = kue.createQueue({
  prefix: 'r',
  redis: {
    port: process.env.REDIS_PORT_6379_TCP_PORT,
    host: 'redis'
  }
});

queue.on('error', log.error);

if(process.env.DASHBOARD_PORT) {
  kue.app.listen(process.env.DASHBOARD_PORT);
  kue.app.set('title', JOB_NAME);
  log.info('Dashboard available at:', process.env.DASHBOARD_PORT);
}

process.once('SIGTERM', function () {
  queue.shutdown(60000, function(err = '') {
    log.info('Queue shutdown: ', err);
    process.exit(0);
  });
});

module.exports = {
  process: function(handler) {
    queue.process(JOB_NAME, handler);
  },

  getPending: function () {
    return new Promise(function(resolve, reject) {
      queue.inactiveCount(function(err, total) {
        if(err) return reject(err);

        resolve(total);
      });
    });
  },

  create: function(data, priority = 'low') {
    return queue.create(JOB_NAME, data).priority(priority).save();
  }
};
