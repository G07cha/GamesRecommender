const CrawlerAPI = require('./crawler-api');
const RecommenderAPI = require('./recommender-api');
const log = require('./logger');

const stats = {
  update: function(statObj) {
    return Promise.all([
      CrawlerAPI.getTotalUsers(),
      RecommenderAPI.getTotalRecommendations()
    ]).then(function(stats) {
      statObj.users = stats[0];
      statObj.recommendations = stats[1];

      return statObj;
    }).catch(function(err) {
      statObj.users = 0;
      statObj.recommendations = 0;
      log.error(err);

      return statObj;
    });
  }
}

module.exports = stats;
