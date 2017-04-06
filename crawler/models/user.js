'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    steamID64: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
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
