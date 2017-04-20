const request = require('request-promise-native');
const { resolve } = require('url');

const ENDPOINT = 'http://recommender/v1/';
const PATHS = {
  recommendation: 'recommendations/',
  recommendationList: 'recommendations'
}

const CrawlerAPI = {
  getRecommendation: function(id, params = {}) {
    return resource('recommendation', id).setParams(params).send();
  },
  getRecommendationList: function(params = {}) {
    return resource('recommendationList').setParams(params).send();
  }
};

function resource(name, id) {
  let params;
  let url = resolve(ENDPOINT, PATHS[name]);
  if(id) {
    url = resolve(url, id);
  }

  this.setParams = function(parameters) {
    params = parameters;
    return this;
  }

  this.send = function() {
    const json = true;
    return request.get({url, params, json});
  }

  return this;
}

module.exports = CrawlerAPI;
