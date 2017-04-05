'use strict';
module.exports = function(sequelize, DataTypes) {
  var Playtime = sequelize.define('Playtime', {
    appId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    value: DataTypes.INTEGER
  }, {
    classMethods: {
      associate: function(models) {
        Playtime.belongsTo(models.User, {
          foreignKey: 'userId',
        });

        Playtime.belongsTo(models.App, {
          foreignKey: 'appId',
        });
      }
    }
  });
  return Playtime;
};
