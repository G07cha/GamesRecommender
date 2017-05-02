'use strict';

const config = require('../config');
const { User, Playtime, App, Genre } = require('../models');
const Queue = require('./queue');
const SteamAPI = require('./steam-api');
const log = require('console-log-level')(config.log);

const steamAPI = new SteamAPI();
const MINIMAL_PLAYTIME = 60; // 2 hours

class Crawler {
  constructor(queue) {
    this.queue = queue || new Queue({
      unique: true
    });

    // Expose for executor
    queue = this.queue;

    this.queue.setExecutor(function(job, done) {
      let newUser, allApps, isNewUser,
        id = job.data;

      if(!id) {
        return;
      }

      log.info('Processing', id);

      return User.findOne({
        where: { id },
        attributes: [ 'id' ]
      }).then(function(user) {
        if(user) {
          log.info(`User with id ${id} already exists in DB, skipping`);
          isNewUser = true;
          throw new Error('Already exists');
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
          },
          attributes: [ 'id' ]
        });
      }).then(function(appsInDB) {
        return Promise.all(allApps.map(function(app) {
          let appInDB = appsInDB.find((a) => app.appId === a.id);

          if(appInDB) {
            return appInDB;
          } else {
            let newApp, allGenres;

            return steamAPI.getAppDetails(app.appId).then(function(appDetails) {
              allGenres = appDetails.genres;

              return App.create({
                id: app.appId,
                name: appDetails.name,
                description: appDetails.description,
                mac: appDetails.platforms.mac,
                windows: appDetails.platforms.windows,
                linux: appDetails.platforms.linux,
                price: appDetails.price.initial,
                logoUrl: app.logo
              });
            }).then(function(appInDB) {
              newApp = appInDB;

              return Promise.all(allGenres.map(function(genre) {
                return Genre.findOrCreate({
                  where: {
                    id: parseInt(genre.id)
                  },
                  defaults: {
                    name: genre.description
                  }
                }).spread(function(model) {
                  return model;
                });
              }));
            }).then(function(genres) {
              return newApp.setGenres(genres);
            }).then(function() {
              return newApp;
            }).catch(function(error) {
              if( typeof error !== 'object' ||
                  Object.keys( error ).length === 0 ||
                  Object.keys( error )[ 0 ].success === false) {
                throw error;
              }
            });
          }
        }));
      }).then(function(appsInDB) {
        // Remove new apps with failed query for details
        appsInDB = appsInDB.filter(Boolean);

        let playtimes = appsInDB.map(function(app) {
          return {
            value: allApps.find((a) => a.appId === app.get('id')).playtimeForever,
            userId: newUser.get('id'),
            appId: app.id
          };
        });

        return Playtime.bulkCreate(playtimes);
      }).then(function() {
        return steamAPI.getFriends(newUser.get('id'));
      }).then(function(friends) {
        return User.findAll({
          where: {
            id: {
              $in: friends
            }
          }
        }).then(function(existingFriends) {
          friends.forEach(function(friendId) {
            let isExists = existingFriends.find((f) => f.get('id') === friendId);
            if(!isExists) {
              queue.addTask(friendId);
            }
          });
        });
      }).then(function() {
        done();
        log.info('Done processing', id);
      }).catch(function(error) {
        if(isNewUser) {
          done();
        } else {
          log.error(error);
          done(error);
        }
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
