'use strict';

const getSteamId = require('../../lib/steam-id');
const UserGames = require('../../lib/games');
const log = require('../../lib/logger');

function gameListingHandler(req, res) {
  getSteamId(req, res).then(function(steamId) {
    let gameList = new UserGames(steamId);
    return gameList.get();
  }).then(function(games) {
    res.render('games-listing', { games });
  }).catch(function(error) {
    log.error(error);
    res.status(500).render('home', {
      error: error
    });
  });
}

module.exports = function(router) {
  router.get('/games', gameListingHandler);
  router.post('/games', gameListingHandler);
};
