'use strict';

const router = require('express').Router();
const { sequelize, App, Playtime, User, Genre } = require('../models');
const epilogue = require('epilogue');

epilogue.initialize({
  app: router,
  sequelize: sequelize
});

let userResource = epilogue.resource({
  model: User,
  endpoints: ['/users', '/users/:id'],
  actions: ['read', 'list'],
  associations: true
});

userResource.read.fetch.before(function(req, res, context) {
  return User.findById(req.params.id).then(function(user) {
    if(user) {
      return;
    }

    return new Promise(function(resolve, reject) {
      req.app
      .get('crawler')
      .addTask(req.params.id, 'high')
      .on('complete', resolve)
      .on('failed', reject);
    });
  }).then(function() {
    return context.continue;
  });
});

epilogue.resource({
  model: Playtime,
  endpoints: ['/playtimes', '/playtimes/:id'],
  actions: ['read', 'list']
});

let appResource = epilogue.resource({
  model: App,
  endpoints: ['/apps', '/apps/:id'],
  actions: ['read', 'list']
});

appResource.list.fetch(function(req, res, context) {
  req.query = req.query || {};
  context.count = req.query.count;
  context.offset = req.query.offset || 0;
  if(req.query.ids) {
    context.criteria.id = {
      $in: req.query.ids.split(',')
    }
    if(req.query.genre) {
      context.count = null;
      context.offset = null;
    }
  }
  return App.findAll({
    where: context.criteria,
    limit: context.count,
    offset: context.offset,
    attributes: req.query.genre ? [ 'id' ] : null,
    include: [{
      model: Genre,
      where: req.query.genre ? { id: req.query.genre } : null
    }]
  }).then(function(apps) {
    if(req.query.genre) {
      return App.findAll({
        where: {
          id: {
            $in: apps.map((app) => app.get('id'))
          }
        },
        limit: req.query.count,
        offset: req.query.offset,
        include: [ Genre ]
      });
    } else {
      return apps;
    }
  }).then(function(apps) {
    context.instance = apps;
    return context.continue;
  });
});

epilogue.resource({
  model: Genre,
  endpoints: ['/genres', '/genres/:id'],
  actions: ['read', 'list']
});

// All users except for one
router.get('/users/not/:id', function(req, res) {
  return User.findAll({
    where: {
      id: {
        $not: req.params.id
      }
    },
    include: [ Playtime ],
    limit: req.params.limit,
    offset: req.params.offset
  }).then(res.send.bind(res)).catch(function (err) {
    res.status(500).send(err);
  });
});

router.get('/total-users', function(req, res) {
  return User.count().then(function(result) {
    res.send(result.toString());
  }).catch(function(err) {
    res.status(500).send(err);
  });
});

module.exports = router;
