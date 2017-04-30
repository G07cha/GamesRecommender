'use strict';

module.exports = function(sequelize, DataTypes) {
  let Genre = sequelize.define('Genre', {
    id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    }
  }, {
    timestamps: false,
    classMethods: {
      associate: function(models) {
        Genre.belongsToMany(models.App, {
          through: 'AppGenre'
        });
      }
    }
  });

  return Genre;
};
