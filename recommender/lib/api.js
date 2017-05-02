'use strict';

const router = require('express').Router();
const { sequelize, Recommendation } = require('../models');
const epilogue = require('epilogue');
const CrawlerAPI = require('./crawler-api');
const log = require('./logger');

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
  if(context.instance.length || !context.criteria.userId) {
    return context.continue;
  } else {
    return CrawlerAPI.getUser(context.criteria.userId).then(function(user) {
      return new Promise(function(resolve, reject) {
        req.app.get('queue').create({
          title: 'Processing ' + user.id,
          id: user.id
        }, 'high').on('complete', resolve).on('failed', reject);
      });
    }).then(function() {
      return Recommendation.findAll(context.options).then(function(recommends) {
        context.instance = recommends;
        return context.continue;
      });
    });
  }
});

router.get('/total-recommendations', function(req, res) {
  Recommendation.count().then(function(total) {
    res.send(total.toString());
  }).catch(function(err) {
    res.status(500).send(err);
    log.error(err);
  });
});

module.exports = router;
