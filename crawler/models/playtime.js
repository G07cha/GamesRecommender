'use strict';
module.exports = function(sequelize, DataTypes) {
  var Playtime = sequelize.define('Playtime', {
    appId: DataTypes.INTEGER,
    userId: DataTypes.BIGINT,
    value: DataTypes.INTEGER
  }, {
    indexes: [ {
      method: 'hash',
      fields: [ 'userId' ]
    } ],
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
