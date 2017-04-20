'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      primaryKey: true
    }
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Playtime, {
          foreignKey: 'userId',
          onDelete: 'cascade'
        });
      }
    }
  });
  return User;
};
