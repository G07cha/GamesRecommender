const request = require('request-promise-native');

function findUser(userId) {
  return request({
    method: 'POST',
    url: 'http://db-manager:3000/v1/query',
    body: {
      query: {
        where: { userId }
      }
    }
  });
}

module.exports = findUser;
