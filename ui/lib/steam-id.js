'use strict';

const SteamAPI = require('./steam-api');

let steamAPI = new SteamAPI();

function steamIdResolver(req, res) {
  return new Promise(function(resolve, reject) {
    if(req.body.value) {
      steamAPI.getUserId(req.body.value).then(function(steamId) {
        if(!steamId) {
          reject(`Cannot find steam id for ${req.body.value}`);
        }

        res.cookie('steamId', steamId);
        resolve(steamId);
      });
    } else if (req.cookies.steamId) {
      resolve(req.cookies.steamId);
    } else {
      reject('Missing steam name')
    }
  });
}

module.exports = steamIdResolver;
