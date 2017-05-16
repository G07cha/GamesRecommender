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
    let appIds;

    return RecommenderAPI.getRecommendationList({
      userId: this.id
    }).then((recommendations) => {
      if(recommendations === 'Accepted') {
        appIds = [];
        return [];
      }
      appIds = recommendations.sort(function(a, b) {
        if(a.priority === b.priority) {
          return 0;
        } else {
          return a.priority > b.priority ? -1 : 1;
        }
      }).map((r) => r.appId);
      params.ids = appIds.join(',');
      params.offset = (page - 1) * count;
      params.count = count;

      return CrawlerAPI.appList(params);
    }).then(function(apps) {
      let sortedApps = [];

      appIds.forEach(function(id) {
        let app = apps.find((a) => a.id === id);

        if(app) {
          sortedApps.push(app);
        }
      });

      return sortedApps;
    });
  }
}

module.exports = UserGames;
