const { wrap } = require('co');
const _ = require('lodash');

const log = global.log || console;
const { mapping } = require('./utils');
const Recommender = require('./recommender');
const { User, Playtime, Recommendation } = require('../shared/models');

module.exports = wrap(function* (userId) {
  if(typeof userId !== 'number') {
    throw new TypeError(`Expected 'userId' as number but recieved ${typeof userId}`);
  }
  let recommender = new Recommender();

  let user = yield User.findOne({
    where: {
      id: userId
    },
    include: [ Playtime ]
  });

  if(!user) {
    throw new Error(`Unable to find user with id: "${userId}"`);
  }

  let target = mapping(user.Playtimes, 'appId', 'value');

  recommender.setTarget(target);

  // Go through all users with playtimes and get recommendations
  log.debug('Processing all users');
  let step = 1000;
  let query = {
    where: {
      id: {
        $not: userId
      }
    },
    include: [ Playtime ],
    limit: step
  };

  let usersCount = yield User.count(query);

  for(query.offset = 0; query.offset < usersCount; query.offset += step) {
    let users = yield User.findAll(query);
    users = users.map(function(user) {
      return mapping(user.Playtimes, 'appId', 'value');
    });

    recommender.addObjects(users);
  }
  log.debug('Processing done');

  let recommendations = recommender.getRecommendations();

  recommendations = _.map(_.keys(recommendations), function(appId) {
    return { appId, userId,
      priority: recommendations[appId]
    };
  });

  return Recommendation.bulkCreate(recommendations);
});
