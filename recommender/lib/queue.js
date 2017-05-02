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

const props = {
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

  onEmpty: function(handler) {
    let checkForEmptyQueue = function() {
      props.getPending().then(function(count) {
        if(count < 1) {
          handler();
        }
      })
    };

    queue.on('job failed', checkForEmptyQueue);
    queue.on('job complete', checkForEmptyQueue);
  },

  create: function(data, priority = 'low') {
    return queue.create(JOB_NAME, data)
      .removeOnComplete(true)
      .priority(priority)
      .save();
  }
};

module.exports = props;
