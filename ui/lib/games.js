const DBAPI = require('./db-api.js');

class UserGames {
  constructor(steamID64) {
    if(!steamID64) {
      throw new Error('steamId is not specified');
    }

    this.user = DBAPI.query('user', {
      where: { steamID64 }
    });
  }

  get(page = 0, perPage = 10) {
    return this.user.then(function(user) {
      return DBAPI.queryAll('recommendation', {
        where: {
          userId: user.id
        },
        offset: perPage * page
      });
    });
  }
}

module.exports = UserGames;
