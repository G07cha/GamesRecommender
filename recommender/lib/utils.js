module.exports = {
  mapping: function(objects, propName, propValue) {
    let result = {};

    if(Array.isArray(objects)) {
      objects.forEach(function(obj) {
        result[obj[propName]] = obj[propValue];
      });
    }

    return result;
  }
};
