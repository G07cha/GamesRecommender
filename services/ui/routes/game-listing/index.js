'use strict';

function gameListingHandler(req, res) {
  res.render('game-listing');
}

module.exports = function(router) {
  router.get('/games', gameListingHandler);
};
