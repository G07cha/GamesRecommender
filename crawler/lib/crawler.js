'use strict';

const config = require('../config');
const { User, Playtime, App } = require('../models');
const Queue = require('./queue');
const SteamAPI = require('./steam-api');
const log = require('console-log-level')(config.log);

const steamAPI = new SteamAPI();
const MINIMAL_PLAYTIME = 60; // 2 hours

class Crawler {
  constructor() {
    let queue = new Queue({
      delay: 4000,
      unique: true
    });

    this.queue = queue;

    this.queue.setExecutor(function(job, done) {
      let newUser, allApps,
        id = job.data;

      if(!id) {
        return;
      }

      return User.findOne({
        where: { id }
      }).then(function(user) {
        if(user) {
          throw new Error(`User with id ${id} already exists in DB, skipping`);
        }

        return User.create({ id });
      }).then(function(user) {
        newUser = user;
        return steamAPI.getUserApps(user.id);
      }).then(function(apps) {
        allApps = apps.filter((app) => app.playtimeForever > MINIMAL_PLAYTIME);

        return App.findAll({
          where: {
            id: allApps.map((app) => app.appId)
          }
        });
      }).then(function(appsInDB) {
        return Promise.all(allApps.map(function(app) {
          let appInDB = appsInDB.find(function(a) {
            return app.appId === a.id;
          });

          if(appInDB) {
            return appInDB;
          } else {
            return App.create({
              id: app.appId,
              name: app.name,
              logoUrl: app.logo
            });
          }
        }));
      }).then(function(appsInDB) {
        let playtimes = allApps.map(function(app) {
          return {
            value: app.playtimeForever,
            userId: newUser.get('id'),
            appId: appsInDB.find((a) => a.get('id') === app.appId).get('id')
          };
        });

        return Playtime.bulkCreate(playtimes);
      }).then(function() {
        return steamAPI.getFriends(newUser.get('id'));
      }).then(function(friends) {
        friends.forEach((friend) => queue.addTask(friend));
        done();
      }).catch(function(error) {
        log.error('Error:', error);
        done(error);
      });
    });
  }

  start() {
    this.queue.start();
  }

  stop() {
    return this.queue.stop();
  }

  addTask(task, priority) {
    return this.queue.addTask(task, priority);
  }
}

module.exports = Crawler;
