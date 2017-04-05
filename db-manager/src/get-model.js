const { User, Recommendation, App, Playtime } = require('../models');
const modelMapping = {
  'user': User,
  'recommendation': Recommendation,
  'app': App,
  'playtime': Playtime
}

function getModel (modelName) {
  if(typeof modelName !== 'string') {
    throw new TypeError('Expected model name to be string but recived: ' + typeof modelName);
  }

  if(modelMapping[modelName]) {
    return modelMapping[modelName];
  } else {
    throw new Error('Cannot find model with name: ' + modelName);
  }
}

module.exports = getModel;
