'use strict';

const find = require('./find');

function register(server, options, next) {
  server.route({
    method: 'POST',
    path: '/query',
    handler: function(request, reply) {
      if(!request.payload) {
        return;
      }
      const {model, query, options} = request.payload;

      find(model, query, options)
        .then(reply)
        .catch((err) => reply(new Error(err)));
    }
  });

  next();
}

register.attributes = {
  name: 'api',
  version: '1.0.0'
};

module.exports = register;
