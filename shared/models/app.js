'use strict';
module.exports = function(sequelize, DataTypes) {
  var App = sequelize.define('App', {
    appId: DataTypes.INTEGER
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        App.hasMany(models.Playtime, {
          foreignKey: 'appId',
          onDelete: 'cascade'
        });

        App.hasMany(models.Recommendation, {
          foreignKey: 'appId',
          onDelete: 'cascade'
        });
      }
    }
  });
  return App;
};
