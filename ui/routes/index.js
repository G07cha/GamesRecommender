'use strict';

const express = require('express');
const fs = require('fs');

const router = express.Router();

fs
  .readdirSync(__dirname)
  .filter(function(folder) {
    return (folder.indexOf('.') !== 0) && (folder !== 'index.js')
  }).forEach(route => {
    require('./' + route)(router);
  });

module.exports = router;
