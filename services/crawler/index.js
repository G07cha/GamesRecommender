require('dotenv').config();

const log = require('console-log-level')({
  prefix: function (level) {
    return new Date().toISOString() + ' [Crawler]'
  },
  level: process.env.LOG || 'info'
});
const { sequelize, User, Playtime, App } = require('../../shared/models');
const Queue = require('./lib/queue');
const SteamAPI = require('./lib/steam-api');

const steamAPI = new SteamAPI();
const queue = new Queue({
  delay: 4000,
  unique: true
});

queue.setExecutor(function(steamID64) {
  let newUser, allApps;

  return User.findOne({
    where: { steamID64 }
  }).then(function(user) {
    if(user) {
      throw new Error(`User with id ${steamID64} already exists in DB, skipping`);
    }

    return User.create({ steamID64 });
  }).then(function(user) {
    newUser = user;
    return steamAPI.getUserApps(user.steamID64);
  }).then(function(apps) {
    allApps = apps = apps.filter((app) => app.playtimeForever > 60);

    return App.findAll({
      where: {
        appId: apps.map((app) => app.appId)
      }
    }).then(function(appsInDB) {
      return Promise.all(apps.map(function(app) {
        let appInDB = appsInDB.find(function(a) {
          return app.appId === a.appId;
        });

        if(appInDB) {
          return appInDB;
        } else {
          return App.create({
            appId: app.appId
          });
        }
      }));
    });
  }).then(function(createdApps) {
    let playtimes = allApps.map(function(app) {
      return {
          value: app.playtimeForever,
          userId: newUser.get('id'),
          appId: createdApps.find((a) => a.get('appId') === app.appId).get('id')
      };
    });

    return Playtime.bulkCreate(playtimes);
  }).then(function() {
    return steamAPI.getFriends(newUser.get('steamID64'));
  }).then(function(friends) {
    friends.forEach(function(friend) {
      queue.addTask(friend.steamid);
    });
  }).catch(function(error) {
    log.error(error.message);
  });
});

process.on('SIGINT', function() {
  log.warning("Caught interrupt signal");

  queue.stop().then(function() {
    process.exit();
  });
});

queue.addTask('76561198051910230');
queue.start();
