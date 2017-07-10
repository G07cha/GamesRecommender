'use strict';

function aboutHandler(req, res) {
  res.render('about');
}

module.exports = function(router) {
  router.get('/about', aboutHandler);
};
