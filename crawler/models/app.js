'use strict';

module.exports = function(sequelize, DataTypes) {
  let App = sequelize.define('App', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      primaryKey: true
    },
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.INTEGER,
    mac: DataTypes.BOOLEAN,
    linux: DataTypes.BOOLEAN,
    windows: DataTypes.BOOLEAN,
    logoUrl: DataTypes.STRING
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
