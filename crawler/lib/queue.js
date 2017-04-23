const kue = require('kue-unique');
const config = require('../config');
const log = require('console-log-level')({
  prefix: function() {
    return new Date().toISOString() + ' [Queue]'
  },
  level: process.env.LOG || 'info'
})

class Queue {
  constructor(settings = {
    delay: 0,
    unique: false
  }) {
    this.settings = settings;
    this.settings.prefix = 'c';
    this.queueName = 'crawl';
    this.settings.redis = config.redis;
    this.q = kue.createQueue(settings);

    // Create WebUI
    if(process.env.DASHBOARD_PORT) {
      kue.app.listen(process.env.DASHBOARD_PORT);
    }

    log.debug('Created with following settings:', this.settings);
  }

  setExecutor(executor) {
    this.executor = executor;
  }

  addTask(task, priority = 'low') {
    return this.q.create(this.queueName, task)
      .unique(task.id)
      .priority(priority)
      .attempts(config.queue.attempts)
      .backoff(config.queue.backoff)
      .removeOnComplete(config.queue.removeOnComplete)
      .save();
  }

  start() {
    if(!this.executor) {
      log.warn('Can\'t start, either it is already running or executor is not set')
      return;
    }

    this.q.process(this.queueName, this.executor);
    log.debug('Queue is started');
  }

  stop() {
    log.debug('Stopping');

    return new Promise(function(resolve, reject) {
      this.q.shutdown(config.queue.shutdown, function(err = '') {
        log.debug('Stopped', err);

        if(err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

module.exports = Queue;
