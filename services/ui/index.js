'use strict';

const express = require('express');
const passport = require('passport');
const compression = require('compression');
const exphbs  = require('express-handlebars');
const expressStatusMonitor = require('express-status-monitor');
const logger = require('morgan');
const bodyParser = require('body-parser');
const { sequelize } = require('./shared/models');

const config = require('./config');
const routes = require('./routes');

const app = express();
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);

app.set('port', process.env.PORT || config.defaultPort);
app.set('env', process.env.MODE || config.defaultMode);
app.set('views', config.views.path);
app.set('view engine', 'handlebars');

app.use(expressStatusMonitor());
app.use(compression());
app.use(logger(config.logger.type));
app.use(bodyParser.json(config.bodyParser.json));
app.use(bodyParser.urlencoded(config.bodyParser.urlencoded));
app.use(passport.initialize());
app.use(passport.session());

// Mount routes
app.use('/', routes);

/**
 * Start Express server.
 */
sequelize.authenticate().then(function() {
  app.listen(app.get('port'));
});

module.exports = app;
