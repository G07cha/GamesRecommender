'use strict';

const _ = require('lodash');

let sameEntityCoef = 0.5;
let valueCoef = 0.1;

module.exports = {
  getCoefs: function() {
    return {sameEntityCoef, valueCoef};
  },
  setCoefs: function(newCoefs) {
    sameEntityCoef = newCoefs.sameEntityCoef || sameEntityCoef;
    valueCoef = valueCoef.sameEntityCoef || valueCoef;
  },
  process: function(entities, target) {
    let recommendations = {};

    entities.forEach(function(entity) {
      let [same, different] = _.partition(_.keys(entity), (value) => target[value]);

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
