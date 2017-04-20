'use strict';
module.exports = function(sequelize, DataTypes) {
  var Recommendation = sequelize.define('Recommendation', {
    appId: DataTypes.STRING,
    userId: DataTypes.STRING,
    priority: DataTypes.INTEGER
  }, {
    timestamps: false,
    classMethods: {
    }
  });
  return Recommendation;
};
