const SteamApi = require('steam-api');
const log = require('console-log-level')({
  prefix: function (level) {
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
    return this._user.GetFriendList(relationship, userId);
  }

  getAppDetails(appId) {
    log.debug('Getting app details for', appId);
    return app.appDetails(appId);
  }
}

module.exports = SteamAPI;
