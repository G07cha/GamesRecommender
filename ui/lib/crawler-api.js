const request = require('request-promise-native');
const { resolve } = require('url');

const ENDPOINT = 'http://crawler/v1/';
const PATHS = {
  user: 'users/',
  userList: 'users',
  playtime: 'playtimes/',
  playtimeList: 'playtimes',
  app: 'apps/',
  appList: 'apps',
}

const CrawlerAPI = {
  getUser: function(id, params = {}) {
    return resource('user', id).setParams(params).send();
  },
  getUserList: function(params = {}) {
    return resource('userList').setParams(params).send();
  },
  getPlaytimeList: function(params = {}) {
    return resource('playtimeList').setParams(params).send();
  },
  getApp: function(id, params) {
    return resource('app', id).setParams(params).send();
  },
  appList: function(params = {}) {
    return resource('appList').setParams(params).send();
  },
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

  this.send = function(additionalData = {}) {
    const json = true;
    let data = {
      url, params, json
    };

    data = Object.assign(additionalData, data);

    return request.get(data);
  }

  return this;
}

module.exports = CrawlerAPI;
