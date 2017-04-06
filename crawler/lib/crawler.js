'use strict';

const config = require('../config');
const { User, Playtime, App } = require('../models');
const Queue = require('./queue');
const SteamAPI = require('./steam-api');
const log = require('console-log-level')(config.log);

const steamAPI = new SteamAPI();

class Crawler {
  constructor() {
    let queue = new Queue({
      delay: 4000,
      unique: true
    });

    this.queue = queue;

    this.queue.setExecutor(function(steamID64) {
      let newUser, allApps;

      if(!steamID64) {
        return;
      }

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
        friends.forEach((friend) => queue.addTask(friend));
      }).catch(function(error) {
        log.error('Error:', error);
      });
    });
  }

  start() {
    this.queue.start();
  }

  stop() {
    return this.queue.stop();
  }

  addTask(task) {
    this.queue.addTask(task);
  }
}

module.exports = Crawler;
