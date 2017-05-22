'use strict';

const SteamAPI = require('./steam-api');
const steamIDRegEx = /\d{17}/;

let steamAPI = new SteamAPI();

function steamIdResolver(req, res) {
  return new Promise(function(resolve, reject) {
    if(req.body.value) {
      // Check if it's already a regular ID
      if(steamIDRegEx.test(req.body.value)) {
        res.cookie('steamId', req.body.value);
        resolve(req.body.value);
      } else {
        steamAPI.getUserId(req.body.value).then(function(steamId) {
          if(!steamId) {
            reject(`Cannot find steam id for ${req.body.value}`);
          }

          res.cookie('steamId', steamId);
          resolve(steamId);
        });
      }
    } else if (req.cookies.steamId) {
      resolve(req.cookies.steamId);
    } else {
      reject('Missing steam name')
    }
  });
}

module.exports = steamIdResolver;
