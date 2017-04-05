'use strict';

const path = require('path');

const config = {
  defaultPort: 3000,
  defaultMode: 'development',
  logger: {
    type: 'tiny'
  },
  views: {
    path: path.join(__dirname, 'views'),
    engine: 'handlebars'
  },
  bodyParser: {
    json: {},
    urlencoded: { extended: true }
  }
};

module.exports = config;
