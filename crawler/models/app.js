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
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
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

        App.belongsToMany(models.Genre, {
          through: 'AppGenre'
        });
      }
    }
  });

  return App;
};
