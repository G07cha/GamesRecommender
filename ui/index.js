'use strict';

const express = require('express');
const compression = require('compression');
const exphbs  = require('express-handlebars');
const expressStatusMonitor = require('express-status-monitor');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const log = require('./lib/logger');
const hbsHelpers = require('./lib/handlebars-helpers');
const config = require('./config');
const routes = require('./routes');

const app = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: hbsHelpers
});

app.engine('handlebars', hbs.engine);

app.set('port', process.env.PORT || config.defaultPort);
app.set('env', process.env.MODE || config.defaultMode);
app.set('views', config.views.path);
app.set('view engine', 'handlebars');

app.use(compression());
app.use(express.static('assets'));
app.use(expressStatusMonitor());
app.use(compression());
app.use(logger(config.logger.type));
app.use(bodyParser.json(config.bodyParser.json));
app.use(bodyParser.urlencoded(config.bodyParser.urlencoded));
app.use(cookieParser());

// Mount routes
app.use('/', routes);

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  log.info('Server is started at ', app.get('port'));
});

module.exports = app;
