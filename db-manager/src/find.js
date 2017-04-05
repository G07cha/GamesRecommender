const getModel = require('./get-model');

function find(modelName, query, options={}) {
  const model = getModel(modelName),
    action = options.single ? 'findOne' : 'findAll';

  return model[action](query);
}

module.exports = find;
