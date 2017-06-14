const _ = require('lodash');
const algorithm = require('./default');
const { mapping } = require('../utils');
const CrawlerAPI = require('../crawler-api');
const { wrap } = require('co');
const log = require('../logger');

let tester = {
  test: function (user, entities) {
    let availablePt, hiddenPt;

    do {
      [availablePt, hiddenPt] = _(user).toPairs().partition(() => Math.random() > 0.6).map((arr) => _.fromPairs(arr));
    } while(Object.keys(hiddenPt) === 0);

    let recommendations = algorithm.process(entities, availablePt);
    // Filter only hidden apps
    let predictedApps = Object.keys(recommendations).filter(function(id) {
      return Object.keys(hiddenPt).find(function(appId) {
        return appId === id;
      });
    });

    let squareSum = predictedApps.reduce(function(sum, appId, predictedIndex) {
      let expectedIndex = Object.keys(hiddenPt).indexOf(appId);
      if(expectedIndex === -1) {
        expectedIndex = 100;
      }
      return sum + Math.pow(predictedIndex - expectedIndex, 2);
    }, 0);

    return Math.sqrt(squareSum / Object.keys(hiddenPt).length);
  },

  optimise: wrap(function* () {
    log.info('Getting user list');
    let testUsers = yield CrawlerAPI.getUserList({
        count: 100
      }),
      {valueCoef, sameEntityCoef} = algorithm.getCoefs(),
      previousCoef = valueCoef * 100,
      previousError = 0,
      data = [],
      meanError;

    testUsers = testUsers.filter((u) => u.Playtimes.length > 10);

    let populateSimilarUsers = wrap(function* (index = 0) {
      let user = testUsers[index];
      let similarUsers = yield CrawlerAPI.getSimilarUsers(user.id, {
        count: 100
      });

      data.push({
        target: mapping(user.Playtimes, 'appId', 'value'),
        entities: similarUsers.map((u) => mapping(u.Playtimes, 'appId', 'value'))
      });

      if(index < testUsers.length - 1) {
        index++;
        return populateSimilarUsers(index);
      }
    });

    log.info('Populating list with similar users');
    yield populateSimilarUsers();

    do {
      let totalErrors = [];

      algorithm.setCoefs({ valueCoef, sameEntityCoef });

      previousError = meanError;

      data.forEach(function(entry) {
        try {
          let error = tester.test(entry.target, entry.entities);
          totalErrors.push(error);
        } catch(err) {
          log.error(err);
        }
      });

      meanError = _.mean(totalErrors);
      log.info('Mean error:', meanError);
      log.info('Coef:', valueCoef);

      let temp = valueCoef;

      if(meanError > previousError) {
        if(valueCoef > previousCoef) {
          valueCoef = previousCoef + (valueCoef - previousCoef) / 2;
        } else {
          valueCoef = previousCoef - (valueCoef - previousCoef) / 2;
        }
      } else {
        if(valueCoef > previousCoef) {
          valueCoef = previousCoef - (valueCoef - previousCoef) / 2;
        } else {
          valueCoef = previousCoef + (valueCoef - previousCoef) / 2;
        }
      }
      previousCoef = temp;
    } while(previousCoef !== valueCoef);
  })
}

tester.optimise().catch(function(error) {
  log.error(error);
});

module.exports = tester;
