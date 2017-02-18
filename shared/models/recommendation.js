'use strict';
module.exports = function(sequelize, DataTypes) {
  var Recommendation = sequelize.define('Recommendation', {
    appId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    priority: DataTypes.INTEGER
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        Recommendation.belongsTo(models.User, {
          foreignKey: 'userId',
        });

        Recommendation.belongsTo(models.App, {
          foreignKey: 'appId',
        });
      }
    }
  });
  return Recommendation;
};
