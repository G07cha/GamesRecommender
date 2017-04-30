'use strict';

module.exports = function(sequelize) {
  let AppGenre = sequelize.define('AppGenre', {}, {
    timestamps: false
  });

  return AppGenre;
};
