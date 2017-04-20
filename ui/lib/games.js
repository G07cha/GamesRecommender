const RecommenderAPI = require('./recommender-api.js');
const CrawlerAPI = require('./crawler-api.js');

class UserGames {
  constructor(id) {
    if(!id) {
      throw new Error('Steam ID is not specified');
    }
    this.id = id;
  }

  get(page = 0, count = 10) {
    return RecommenderAPI.getRecommendationList({
      offset: page * count,
      count
    }).then(function(recommendations) {
      return Promise.all(recommendations.map(function(r) {
        return CrawlerAPI.getApp(r.appId);
      }));
    });
  }
}

module.exports = UserGames;
