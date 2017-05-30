'use strict';

const { sequelize, Genre } = require('../../../models');
const epilogue = require('epilogue');

module.exports = function genresRoutes(router) {
  epilogue.initialize({
    app: router,
    sequelize: sequelize
  });

  epilogue.resource({
    model: Genre,
    endpoints: ['/genres', '/genres/:id'],
    actions: ['read', 'list']
  });
};
