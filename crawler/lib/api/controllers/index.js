'use strict';

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const basename  = path.basename(module.filename);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    require(`./${file}`)(router);
  });

module.exports = router;
