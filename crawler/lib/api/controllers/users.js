'use strict';

const { sequelize, User, Playtime } = require('../../../models');
const epilogue = require('epilogue');

module.exports = function usersRoutes(router) {
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
        .get('queue')
        .process({
          data: req.params.id
        });
    }).then(function() {
      return context.continue;
    });
  });

  // All users except for one
  router.get('/users/not/:id', function(req, res, next) {
    return User.findAll({
      where: {
        id: {
          $not: req.params.id
        }
      },
      include: [ Playtime ],
      limit: req.params.limit,
      offset: req.params.offset
    }).then(res.send.bind(res)).catch(next);
  });

  router.get('/users/similar/:id', function(req, res, next) {
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
    }).then(res.send.bind(res)).catch(next);
  });

  router.get('/total-users', function(req, res, next) {
    return User.count().then(function(result) {
      res.send(result.toString());
    }).catch(next);
  });
};
