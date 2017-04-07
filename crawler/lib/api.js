'use strict';

const router = require('express').Router();
const { sequelize, App, Playtime, User } = require('../models');
const epilogue = require('epilogue');

epilogue.initialize({
  app: router,
  sequelize: sequelize
});

epilogue.resource({
  model: User,
  endpoints: ['/users', '/users/:id']
});

epilogue.resource({
  model: Playtime,
  endpoints: ['/playtimes', '/playtimes/:id']
});

epilogue.resource({
  model: App,
  endpoints: ['/apps', '/apps/:id']
});

module.exports = router;
