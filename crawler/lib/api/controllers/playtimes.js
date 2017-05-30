'use strict';

const { sequelize, Playtime } = require('../../../models');
const epilogue = require('epilogue');

module.exports = function playtimesRoutes(router) {
  epilogue.initialize({
    app: router,
    sequelize: sequelize
  });

  epilogue.resource({
    model: Playtime,
    endpoints: ['/playtimes', '/playtimes/:id'],
    actions: ['read', 'list']
  });
};
