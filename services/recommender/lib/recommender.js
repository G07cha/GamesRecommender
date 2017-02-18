const _ = require('lodash');
const log = global.log || console;
const similarityCoef = 1;

class Recommender {
  constructor(target, alghorithm = 'default') {
    this.recommendations = {};
    if(target) {
      this.setTarget(target);
    }

    try {
      this.algorithm = require('./algorithms/' + alghorithm);
    } catch(err) {
      log.error('Failed to load an algorithm trying falling back to default');
      log.error(err);
      this.algorithm = require('./algorithms/default');
    }

    if(typeof this.algorithm.init === 'function') {
      log.debug('Initting algorithm');
      this.algorithm.init();
      log.debug('Init finished');
    }
  }

  setTarget(target) {
    this.target = _.clone(target);
  }

  /**
   * Process chunk of objects and update documentation
   */
  addObjects(objects) {
    objects = _.clone(objects);

    log.debug('Processing objects');
    let newRecommendations = this.algorithm.process(objects, this.target);
    log.debug('Processing is done, updating recommendations');

    _.assignWith(
      this.recommendations, newRecommendations, function(val, newVal) {
      return _.floor(_.isUndefined(val) ? newVal : val + newVal);
    });
  }

  getRecommendations() {
    return this.recommendations;
  }
}

module.exports = Recommender;
