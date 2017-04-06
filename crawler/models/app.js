'use strict';

module.exports = function(sequelize, DataTypes) {
  let App = sequelize.define('App', {
    appId: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    },
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        App.hasMany(models.Playtime, {
          foreignKey: 'appId',
          onDelete: 'cascade'
        });
      }
    }
  });

  return App;
};
