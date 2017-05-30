'use strict';

module.exports = function miscRoutes(router) {
  router.get('/ping', function(req, res) {
    res.status(200).send('pong');
  });
};
