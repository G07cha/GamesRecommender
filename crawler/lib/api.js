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

epilogue.resource({
  model: App,
  endpoints: ['/apps', '/apps/:id'],
  actions: ['read', 'list'],
  include: [ Genre ]
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

module.exports = router;
