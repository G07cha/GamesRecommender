const { resolve } = require('url');
const request = require('request-promise-native').defaults({
  json: true,
  baseUrl: 'http://crawler:3000/v1/'
});

const PATHS = {
  user: '/users/',
  userList: '/users',
  totalUsers: '/total-users',
  userListExcl: '/users/not/',
  similarUsers: '/users/similar/',
  playtime: '/playtimes/',
  playtimeList: '/playtimes',
  app: '/apps/',
  appList: '/apps',
  ping: '/ping'
}

const CrawlerAPI = {
  getUser: function(id, params = {}) {
    return resource('user', id).setParams(params).send();
  },
  getUserList: function(params = {}) {
    return resource('userList').setParams(params).send();
  },
  getUserCount: function(params = {}) {
    params = JSON.parse(JSON.stringify(params));
    params.limit = 1;

    return resource('userList').setParams(params).send({
      resolveWithFullResponse: true
    }).then(function(response) {
      let contentRange = response.headers['content-range'];

      return parseInt(contentRange.substr(contentRange.lastIndexOf('/') + 1));
    });
  },
  getTotalUsers: function() {
    return resource('totalUsers').setParams().send();
  },
  getUserListWithExclude(id, params = {}) {
    return resource('userListExcl', id).setParams(params).send();
  },
  getSimilarUsers: function(id, params = {}) {
    return resource('similarUsers', id).setParams(params).send();
  },
  getPlaytimeList: function(params = {}) {
    return resource('playtimeList').setParams(params).send();
  },
  appList: function(params = {}) {
    return resource('appList').setParams(params).send();
  },
  ping: function() {
    return resource('ping').send();
  },
  waitForBoot: function(timeout = null, interval = 100) {
    let startTime = Date.now();

    return CrawlerAPI.ping().catch(function() {
      if(timeout !== null) {
        let endTime = Date.now();
        timeout -= endTime - startTime;
      }

      if(timeout > 0 || timeout === null) {
        return new Promise(function(resolve) {
          setTimeout(function() {
            resolve(CrawlerAPI.waitForBoot(timeout, interval));
          }, interval);
        });
      } else {
        throw new Error('Crawler API doesn\'t came online after ' + timeout + 'ms');
      }
    });
  }
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
