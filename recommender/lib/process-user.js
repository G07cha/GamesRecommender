const { wrap } = require('co');
const _ = require('lodash');

const log = require('./logger');
const { mapping } = require('./utils');
const Recommender = require('./recommender');
const { Recommendation } = require('../models');
const CrawlerAPI = require('./crawler-api');

module.exports = wrap(function* (userId) {
  if(typeof userId !== 'string') {
    throw new TypeError(`Expected 'userId' as number but recieved ${typeof userId}`);
  }

  let recommender = new Recommender();
  let user = yield CrawlerAPI.getUser(userId);

  if(!user) {
    throw new Error(`Unable to find user with id: "${userId}"`);
  }

  let target = mapping(user.Playtimes, 'appId', 'value');

  recommender.setTarget(target);

  // Go through all users with playtimes and get recommendations
  log.debug('Processing all users');
  let step = 1000;
  let options = {
    limit: step
  };

  let users = yield CrawlerAPI.getSimilarUsers(userId, options);
  users = users.map(function(user) {
    return mapping(user.Playtimes, 'appId', 'value');
  });
  recommender.addObjects(users);

  log.debug('Processing done');

  let recommendations = recommender.getRecommendations();

  recommendations = _.map(_.keys(recommendations), function(appId) {
    return { appId, userId,
      priority: recommendations[appId]
    };
  });

  let existingRecords = yield Recommendation.findAll({
    where: {
      appId: {
        $in: recommendations.map((r) => r.appId)
      },
      userId: userId
    }
  });

  let [recommendsToUpdate, recommendsToCreate] = _.partition(recommendations,
    function(recommendation) {
      return existingRecords.find((existing) => {
        return existing.appId === recommendation.appId
      });
    });

  return Promise.all([
    Recommendation.bulkCreate(recommendsToCreate),
    recommendsToUpdate.map(function(recommendation) {
      let record = existingRecords.find((existing) => {
        return existing.appId === recommendation.appId
      });

      if(record.priority !== recommendation.priority) {
        return record.update({
          priority: recommendation.priority
        });
      }
    }).filter(Boolean)
  ]);
});
