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
  endpoints: ['/users', '/users/:id'],
  actions: ['read', 'list'],
  associations: true
});

epilogue.resource({
  model: Playtime,
  endpoints: ['/playtimes', '/playtimes/:id'],
  actions: ['read', 'list']
});

epilogue.resource({
  model: App,
  endpoints: ['/apps', '/apps/:id'],
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
