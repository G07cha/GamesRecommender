const request = require('request-promise-native');
const { resolve } = require('url');

const ENDPOINT = 'http://crawler/v1';
const PATHS = {
  user: '/users/',
  userList: '/users',
  userListExcl: '/users/not',
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
  getUserListWithExclude(id, params = {}) {
    return resource('userListExcl', id).setParams(params).send();
  },
  getPlaytimeList: function(params = {}) {
    return resource('playtimeList').setParams(params).send();
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
  }

  this.send = function() {
    const json = true;
    return request.get({url, params, json});
  }
}

module.exports = CrawlerAPI;
