'use strict';

const router = require('express').Router();
const { sequelize, Recommendation } = require('../models');
const epilogue = require('epilogue');
const CrawlerAPI = require('./crawler-api');

epilogue.initialize({
  app: router,
  sequelize: sequelize
});

let recommendationResource = epilogue.resource({
  model: Recommendation,
  endpoints: ['/recommendations', '/recommendations/:id'],
  actions: ['read', 'list'],
  sort: {
    default: '-priority'
  }
});

recommendationResource.list.fetch.after(function(req, res, context) {
  if(context.instance.length) {
    return context.continue;
  } else {
    return CrawlerAPI.getUser(context.criteria.userId).then(function(user) {
      return new Promise(function(resolve, reject) {
        req.app.get('queue').create({
          title: 'Processing ' + user.id,
          id: user.id
        }).on('complete', resolve).on('failed', reject);
      });
    }).then(function() {
      return Recommendation.findAll(context.options).then(function(recommends) {
        context.instance = recommends;
        return context.continue;
      });
    });
  }
});

module.exports = router;
