'use strict';

function homeHandler(req, res) {
  res.render('home');
}

module.exports = function(router) {
  router.get('/', homeHandler);
};
