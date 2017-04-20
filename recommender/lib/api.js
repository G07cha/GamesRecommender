'use strict';

const router = require('express').Router();
const { sequelize, Recommendation } = require('../models');
const epilogue = require('epilogue');

epilogue.initialize({
  app: router,
  sequelize: sequelize
});

epilogue.resource({
  model: Recommendation,
  endpoints: ['/recommendations', '/recommendations/:id'],
  actions: ['read', 'list'],
  sort: {
    default: 'priority'
  }
});

module.exports = router;
