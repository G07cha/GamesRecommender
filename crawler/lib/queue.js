const log = require('console-log-level')({
  prefix: function() {
    return new Date().toISOString() + ' [Queue]'
  },
  level: process.env.LOG || 'info'
})

let _interval = new WeakMap();

class Queue {
  constructor(settings = {
    delay: 0,
    unique: false
  }) {
    this.settings = settings;
    this.tasks = [];
    log.debug('Created with following settings:', this.settings);
  }

  setExecutor(executor) {
    this.executor = executor;
  }

  addTask(task) {
    if(this.settings.unique && this.tasks.find((t) => t === task)) {
      return;
    }

    this.tasks.push(task);
  }

  start() {
    if(_interval.has(this) || !this.executor) {
      log.warn('Can\'t start, either interval is already running or executor is not set')
      return;
    }

    let interval = setInterval(() => {
      log.debug('Running iteration');

      if(this.tasks.length === 0) {
        log.debug('Tasklist is empty');
        this.stop();
      }

      this._currentTask = this.executor(
        this.tasks.shift()
      );
    }, this.settings.delay);

    _interval.set(this, interval);
    log.debug('Queue is started');
  }

  stop() {
    log.debug('Stopping');
    clearInterval(_interval.get(this));
    _interval.delete(this);
    log.debug('Stopped');

    return this._currentTask;
  }
}

module.exports = Queue;
