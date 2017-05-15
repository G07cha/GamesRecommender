'use strict';
module.exports = function(sequelize, DataTypes) {
  var Recommendation = sequelize.define('Recommendation', {
    appId: DataTypes.INTEGER,
    userId: DataTypes.BIGINT,
    priority: DataTypes.INTEGER
  }, {
    indexes: [ {
      method: 'hash',
      fields: [ 'userId' ]
    } ],
    timestamps: false,
    classMethods: {
    }
  });
  return Recommendation;
};
