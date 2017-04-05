const request = require('request-promise-native');

const DBAPI = {
  query: function(model, query) {
    let options = { single: true };

    return request.post({
      url: 'http://db-manager:3000/v1/query',
      body: { model, query, options },
      json: true
    });
  },
  queryAll: function(model, query) {
    return request.post({
      url: 'http://db-manager:3000/v1/query',
      body: { model, query },
      json: true
    });
  }
}

module.exports = DBAPI;
