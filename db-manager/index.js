'use strict';

const config = require('./config');

const Hapi = require('hapi');
const log = require('console-log-level')(config.log);

const {sequelize} = require('./models');

const server = new Hapi.Server();
server.connection({
  host: process.env.HOST || config.defaultHost,
  port: process.env.PORT || config.defaultPort
});

server.register({
  register: require('./src/routes')
}, {
  routes: {
    prefix: config.versionPrefix
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
  log.error('Unable to connect to the DB', err);
});
