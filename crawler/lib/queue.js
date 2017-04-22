const kue = require('kue');
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
    this.settings.redis = {
      port: process.env.REDIS_PORT_6379_TCP_PORT,
      host: 'redis'
    }
    this.tasks = [];
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
    let existingTask = this.tasks.find((t) => t === task);
    if(existingTask) {
      return existingTask;
    }

    let newTask = this.q.create('crawl', task).priority(priority).save();
    this.tasks.push(newTask);

    return newTask;
  }

  start() {
    if(!this.executor) {
      log.warn('Can\'t start, either it is already running or executor is not set')
      return;
    }

    this.q.process('crawl', this.executor);
    log.debug('Queue is started');
  }

  stop() {
    log.debug('Stopping');

    return new Promise(function(resolve, reject) {
      this.q.shutdown(60000, function(err = '') {
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
