const RecommenderAPI = require('./recommender-api');
const log = require('./logger');

const stats = {
  update: function(statObj) {
    return RecommenderAPI.getStats().then(function(stats) {
      statObj.users = stats.users;
      statObj.recommendations = stats.recommendations;

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
