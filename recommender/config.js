'use strict';

const config = {
  versionPrefix: '/v1',
  defaultPort: 4000,
  defaultHost: '0.0.0.0',
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
        'logging': false
      }
    }
  },
  logger: {
    type: 'tiny'
  },
  log: {
    prefix: function () {
      return new Date().toISOString() + ' [DB-Manager]'
    },
    level: process.env.LOG || 'info'
  }
};

module.exports = config;
