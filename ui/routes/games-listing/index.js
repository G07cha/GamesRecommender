'use strict';

const getSteamId = require('../../lib/steam-id');
const UserGames = require('../../lib/games');
const log = require('../../lib/logger');

function gameListingHandler(req, res) {
  let page = parseInt(req.query.page) || 1;
  let nextPage = page + 1;
  let prevPage;
  if(page > 1) {
    prevPage = page - 1;
  }

  getSteamId(req, res).then(function(steamId) {
    let gameList = new UserGames(steamId);

    return gameList.get(page, 20, {
      genre: req.query.genre
    });
  }).then(function(games) {
    res.render('games-listing', { nextPage, prevPage, games });
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
