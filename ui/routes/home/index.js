'use strict';

const stats = require('../../lib/stats');
const statObj = {};

// Check stats every 5 minutes
stats.update(statObj);
setInterval(stats.update.bind(stats, statObj), 60000 * 5);

function homeHandler(req, res) {
  res.render('home', {
    stats: statObj
  });
}

module.exports = function(router) {
  router.get('/', homeHandler);
};
