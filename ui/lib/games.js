const RecommenderAPI = require('./recommender-api.js');
const CrawlerAPI = require('./crawler-api.js');

class UserGames {
  constructor(id) {
    if(!id) {
      throw new Error('Steam ID is not specified');
    }
    this.id = id;
  }

  get(page = 1, count = 10, params = {}) {
    return RecommenderAPI.getRecommendationList({
      userId: this.id
    }).then(function(recommendations) {
      params.ids = recommendations.map((r) => r.appId).join(',');
      params.offset = (page - 1) * count;
      params.count = count;
      return CrawlerAPI.appList(params);
    });
  }
}

module.exports = UserGames;
