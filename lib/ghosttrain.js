var utils = require('./utils');
var Route = require('./route');
var send = require('./send');

/**
 * GhostTrain constructor
 */

function GhostTrain () {
  this.routes = {
    'get': [],
    'post': [],
    'put': [],
    'delete': []
  };

  this.settings = {
    'case sensitive routing': false,
    'strict routing': false,
    'json replacer': undefined,
    'json spaces': undefined
  };
}
module.exports = GhostTrain;

/**
 * GhostTrain#VERB(route, callback)
 * VERB can be 'post', 'put', 'delete', or 'get', similar to Express's routing system.
 *
 * GhostTrain#get(key) also can retrieve a configuration setting on the GhostTrain instance.
 *
 * @param {String|Regex} route
 * @param {Function} function
 */

['post', 'put', 'delete'].forEach(function (verb) {
  GhostTrain.prototype[verb] = addRoute(verb);
});

GhostTrain.prototype.get = function () {
  if (arguments.length === 1)
    return this.settings[arguments[0]];
  else
    return addRoute('get').apply(this, utils.arrayify(arguments));
};

/**
 * Set a configuration setting on the GhostTrain instance
 *
 * @param {String} key
 * @param {Mixed} value
 */

GhostTrain.prototype.set = function (key, value) {
  this.settings[key] = value;
};

/**
 * Set a configuration setting on the GhostTrain instance to `true`
 *
 * @param {String} key
 */

GhostTrain.prototype.enable = function (key) {
  this.settings[key] = true;
};

/**
 * Set a configuration setting on the GhostTrain instance to `false`
 *
 * @param {String} key
 */

GhostTrain.prototype.enable = function (key) {
  this.settings[key] = false;
};

/**
 * Makes a request to the routing service.
 */

GhostTrain.prototype.send = function () {
  return send.apply(null, [this].concat(utils.arrayify(arguments)));
};

function addRoute (verb) {
  return function (path, fn) {
    this.routes[verb].push(new Route(verb, path, fn, {
      sensitive: this.settings['case sensitive routing'],
      strict: this.settings['strict routing']
    }));
  };
}
