'use strict';

const router = require('express').Router();
const { sequelize, Recommendation } = require('../models');
const epilogue = require('epilogue');
const CrawlerAPI = require('./crawler-api');
const log = require('./logger');
const pendingJobs = {};

epilogue.initialize({
  app: router,
  sequelize: sequelize
});

epilogue.resource({
  model: Recommendation,
  endpoints: ['/recommendations', '/recommendations/:id'],
  actions: ['read'],
  sort: {
    default: '-priority'
  }
});

router.get('/recommendations', function(req, res) {
  let {count, offset, sort} = req.query;

  delete req.query.count;
  delete req.query.offset;
  delete req.query.sort;

  Recommendation.findAll({
    where: req.query,
    limit: count,
    offset, sort
  }).then(function(list) {
    if(list.length) {
      res.send(list);
    } else {
      res.sendStatus(202);

      return CrawlerAPI.getUser(req.query.userId).then(function(user) {
        pendingJobs[user.id] = true;

        return new Promise(function(resolve, reject) {
          req.app.get('queue').create({
            title: 'Processing ' + user.id,
            id: user.id
          }, 'high').on('complete', function() {
            delete pendingJobs[user.id];
            resolve();
          }).on('failed', reject);
        });
      });
    }
  }).catch(function(err) {
    res.status(500).send(err);
  });
});

router.get('/recommendations/status/:id', function(req, res) {
  if(pendingJobs[req.params.id]) {
    res.send({
      status: 'pending'
    });
  } else {
    res.status(201).send({
      status: 'done'
    });
  }
});

router.get('/stats', function(req, res) {
  Promise.all([
    Recommendation.count(),
    Recommendation.aggregate('userId', 'count', {
      distinct: true
    })
  ]).then(function(stats) {
    res.send({
      recommendations: stats[0],
      users: stats[1]
    });
  }).catch(function(err) {
    res.status(500).send(err);
    log.error(err);
  });
});

module.exports = router;
