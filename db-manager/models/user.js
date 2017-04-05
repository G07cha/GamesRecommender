'use strict';
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    steamID64: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        User.hasMany(models.Playtime, {
          foreignKey: 'userId',
          onDelete: 'cascade'
        });

        User.hasMany(models.Recommendation, {
          foreignKey: 'userId',
          onDelete: 'cascade'
        });
      }
    }
  });
  return User;
};
