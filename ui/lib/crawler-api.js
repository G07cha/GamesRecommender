const { resolve } = require('url');
const request = require('request-promise-native').defaults({
  json: true,
  baseUrl: 'http://crawler:3000/v1/'
});

const PATHS = {
  user: '/users/',
  userList: '/users',
  totalUsers: '/total-users',
  playtime: '/playtimes/',
  playtimeList: '/playtimes',
  app: '/apps/',
  appList: '/apps',
}

const CrawlerAPI = {
  getUser: function(id, params = {}) {
    return resource('user', id).setParams(params).send();
  },
  getUserList: function(params = {}) {
    return resource('userList').setParams(params).send();
  },
  getTotalUsers: function() {
    return resource('totalUsers').setParams().send();
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
  let qs;
  let url = PATHS[name];
  if(id) {
    url = resolve(url, id);
  }

  this.setParams = function(parameters) {
    qs = parameters;
    return this;
  }

  this.send = function(additionalData = {}) {
    let data = {
      url, qs
    };

    data = Object.assign(additionalData, data);

    return request.get(data);
  }

  return this;
}

module.exports = CrawlerAPI;
