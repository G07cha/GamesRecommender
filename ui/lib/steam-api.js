const SteamApi = require('steam-api');

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
    return this._user.ResolveVanityUrl(user);
  }
}

module.exports = SteamAPI;
