module.exports = {
  mapping: function(objects, propName, propValue) {
    let result = {};

    objects.forEach(function(obj) {
      result[obj[propName]] = obj[propValue];
    });

    return result;
  }
};
