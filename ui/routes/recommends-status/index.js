'use strict';

const RecommenderAPI = require('../../lib/recommender-api');
const getSteamId = require('../../lib/steam-id');

function statusHandler(req, res) {
  return getSteamId(req, res).then(function(steamId) {
    return RecommenderAPI.getUsersRecommendationsStatus(steamId);
  }).then(res.send.bind(res)).catch(function(err) {
    res.status(500).send(err);
  });
}

module.exports = function(router) {
  router.get('/games/status', statusHandler);
};
