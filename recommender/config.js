'use strict';

const config = {
  versionPrefix: '/v1',
  defaultPort: 80,
  defaultHost: '0.0.0.0',
  db: {
    'development': {
      'use_env_variable': 'DB',
      'dialect': 'postgres',
      'logging': false
    },
    'production': {
      'use_env_variable': 'DB',
      'dialect': 'postgres',
      'logging': false
    }
  },
  log: {
    prefix: function () {
      return new Date().toISOString() + ' [DB-Manager]'
    },
    level: process.env.LOG || 'info'
  }
};

module.exports = config;
