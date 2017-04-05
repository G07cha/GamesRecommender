const _ = require('lodash');

const sameEntityCoef = 0.5;
const valueCoef = 0.1;

module.exports = {
  process: function(entities, target) {
    let recommendations = {};

    entities.forEach(function(entity) {
      let entityRecommendations = {};

      [same, different] = _.partition(_.keys(entity), (value) => target[value]);

      let baseCost = same.length * sameEntityCoef;

      different.forEach(function(prop) {
        recommendations[prop] = _.sum([
          recommendations[prop],
          entity[prop] * valueCoef,
          baseCost]);
      });
    });

    return recommendations;
  }
};
