const { resolve } = require('url');
const request = require('request-promise-native').defaults({
  json: true,
  baseUrl: 'http://recommender/v1/'
});

const PATHS = {
  recommendation: '/recommendations/',
  recommendationStatus: '/recommendations/status/',
  recommendationList: '/recommendations',
  stats: '/stats'
}

const CrawlerAPI = {
  getRecommendation: function(id, params = {}) {
    return resource('recommendation', id).setParams(params).send();
  },
  getUsersRecommendationsStatus: function(id, params = {}) {
    return resource('recommendationStatus', id).setParams(params).send();
  },
  getRecommendationList: function(params = {}) {
    return resource('recommendationList').setParams(params).send();
  },
  getStats: function() {
    return resource('stats').send();
  }
};

function resource(name, id) {
  let qs;
  let url = PATHS[name];
  if(id) {
    url = resolve(url, id);
  }

  this.setParams = function(params) {
    qs = params;
    return this;
  }

  this.send = function() {
    return request.get({url, qs});
  }

  return this;
}

module.exports = CrawlerAPI;
