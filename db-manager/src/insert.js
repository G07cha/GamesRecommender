const getModel = require('./get-model');

function insert(modelName, entity, options={}) {
  const model = getModel(modelName);

  return model.create(entity, options);
}

function bulkInsert(modelName, collection) {
  if(Array.isArray(collection) === false) {
    throw new TypeError(
      'Expected collection to be an array but recived: ' + (typeof collection)
    );
  }

  const model = getModel(modelName);

  return model.bulkCreate(collection);
}

module.exports = {insert, bulkInsert};
