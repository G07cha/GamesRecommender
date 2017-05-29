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

    return req.app
      .get('crawler')
      .process({
        data: req.params.id
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

epilogue.resource({
  model: App,
  endpoints: ['/apps', '/apps/:id'],
  actions: ['read']
});

router.get('/apps', function(req, res) {
  let context = {
    criteria: {}
  };

  req.query = req.query || {};
  context.count = req.query.count;
  context.offset = req.query.offset || 0;
  if(req.query.ids) {
    context.criteria.id = {
      $in: req.query.ids.split(',')
    }
    context.order = context.criteria.id.$in.map((id) => sequelize.literal(`"App".id=${id} DESC`));
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
    order: context.order,
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
    res.send(apps);
    return context.stop;
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

router.get('/users/similar/:id', function(req, res) {
  const countFieldName = 'plcount';
  let appIds;

  return User.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ['id'],
    include: [{
      model: Playtime,
      attributes: ['appId']
    }]
  }).then(function(user) {
    if(!user) {
      throw new Error(`User with id '${req.params.id}' is not found`);
    }

    appIds = user.Playtimes.map((playtime) => playtime.get('appId'));

    return Playtime.findAll({
      offset: req.query.offset,
      limit: req.query.count,
      where: {
        appId: {
          $in: appIds
        },
        userId: {
          $not: req.params.id
        }
      },
      attributes: [
        [sequelize.literal('COUNT(id)'), countFieldName],
        'userId'
      ],
      order: [[sequelize.literal(countFieldName), 'DESC']],
      group: ['userId']
    });
  }).then(function(playtimes) {
    return User.findAll({
      where: {
        id: {
          $in: playtimes.map((playtime) => playtime.get('userId'))
        }
      },
      limit: req.query.count,
      include: [Playtime]
    });
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

router.get('/ping', function(req, res) {
  res.status(200).send('pong');
});

module.exports = router;
