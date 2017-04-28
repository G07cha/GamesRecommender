'use strict';

const SteamApi = require('steam-api');
const log = require('console-log-level')({
  prefix: function () {
    return new Date().toISOString() + ' [Steam]'
  },
  level: process.env.LOG || 'info'
})

class SteamAPI {
  constructor(apiKey = process.env.STEAM_API_KEY) {
    Object.defineProperties(this, {
      'apiKey': {
        value: apiKey
      },
      '_user': {
        value: new SteamApi.User(apiKey)
      },
      '_player': {
        value: new SteamApi.Player(apiKey)
      },
      '_app': {
        value: new SteamApi.App(apiKey)
      }
    });
  }

  getUserId(user) {
    log.debug('Getting user id for', user);
    return this._user.ResolveVanityUrl(user);
  }

  getUserApps(userId, options = {
    includeInfo: true,
    includeFree: true,
    filter: []
  }) {
    log.debug('Getting user apps for', userId);
    return this._player.GetOwnedGames(
      userId, options.includeInfo, options.includeFree, options.filter
    );
  }

  getFriends(userId, relationship = 'all') {
    log.debug('Getting friends for', userId);
    this._user.setMethod('GetFriendList');
    this._user.setVersion(1);

    return this._user.setupClient({
      steamId: userId,
      relationship: relationship
    }).then(function(resp) {
      return resp.data.friendslist.friends.map((f) => f.steamid);
    }).catch(function() {
      return [];
    });
  }

  getAppDetails(appId) {
    log.debug('Getting app details for', appId);
    return this._app.appDetails(appId);
  }
}

module.exports = SteamAPI;
