'use strict';
require('dotenv').config();

const Hapi = require('hapi');
const {sequelize} = require('./shared/models');
const log = require('console-log-level')({
  prefix: function (level) {
    return new Date().toISOString() + ' [API]'
  },
  level: process.env.LOG || 'info'
})

const server = new Hapi.Server();
server.connection({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 8000
});

// Add the route
server.route({
  method: 'GET',
  path:'/recommendations/{userId}',
  handler: function (req, res) {
  }
});

sequelize.authenticate().then(function() {
  server.start((err) => {
    if (err) {
        throw err;
    }
    log.info('Server running at:', server.info.uri);
  });
}).catch(function(err) {
  console.log('Unable to connect to the DB', err);
});
