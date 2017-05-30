'use strict';

const { sequelize, App, Genre } = require('../../../models');
const epilogue = require('epilogue');

module.exports = function appsRoutes (router) {
  epilogue.initialize({
    app: router,
    sequelize: sequelize
  });

  epilogue.resource({
    model: App,
    endpoints: ['/apps', '/apps/:id'],
    actions: ['read']
  });

  // Custom listing route
  router.get('/apps', function(req, res) {
    let context = {
      where: {},
      include: [{
        model: Genre,
        where: req.query.genre ? { id: req.query.genre } : null
      }]
    };

    req.query = req.query || {};
    context.limit = req.query.count;
    context.offset = req.query.offset || 0;
    if(req.query.ids) {
      context.where.id = {
        $in: req.query.ids.split(',')
      }
      context.order = context.where.id.$in.map((id) => sequelize.literal(`"App".id=${id} DESC`));
      if(req.query.genre) {
        context.attributes = [ 'id' ];
        context.count = null;
        context.offset = null;
      }
    }

    return App.findAll(context).then(function(apps) {
      if(req.query.genre) {
        return App.findAll({
          where: {
            id: {
              $in: apps.map((app) => app.get('id'))
            }
          },
          limit: context.limit,
          offset: context.offset,
          include: [ Genre ]
        });
      } else {
        return apps;
      }
    }).then(function(apps) {
      res.send(apps);
    });
  });
};
