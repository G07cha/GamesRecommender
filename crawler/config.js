'use strict';

const config = {
  versionPrefix: '/v1',
  defaultPort: 3000,
  defaultHost: '0.0.0.0',
  queue: {
    attempts: 3,
    backoff: {
      delay: 60 * 60 * 1000, // Hour in ms
      type:'exponential'
    },
    removeOnComplete: true,
    shutdownTimeout: 60 * 1000 // Minute in ms
  },
  redis: {
    port: process.env.REDIS_PORT_6379_TCP_PORT,
    host: 'redis'
  },
  db: {
    'development': {
      'use_env_variable': 'DB',
      options: {
        'dialect': 'postgres'
      }
    },
    'production': {
      'use_env_variable': 'DB',
      options: {
        'dialect': 'postgres',
        'logging': false,
        pool: {
          min: 0,
          max: 8
        }
      }
    }
  },
  logger: {
    type: 'tiny'
  },
  log: {
    prefix: function () {
      return new Date().toISOString() + ' [Crawler]'
    },
    level: process.env.LOG || 'info'
  },
  bodyParser: {
    json: {},
    urlencoded: { extended: true }
  }
};

module.exports = config;
