var utils = require('./utils');
var sendRequest = require('./sendRequest');
var methods = require('./methods');
var each = require('foreach-shim');

/**
 * GhostTrain constructor
 */

function GhostTrain () {
  this.routes = {};

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

each(methods, function (verb) {
  if (verb === 'get') {
    GhostTrain.prototype.get = function () {
      if (arguments.length === 1)
        return this.settings[arguments[0]];
      else
        return utils.addRoute('get').apply(this, utils.arrayify(arguments));
    };
  } else {
    GhostTrain.prototype[verb] = utils.addRoute(verb);
  }
});

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

GhostTrain.prototype.request = function () {
  return sendRequest.apply(null, [this].concat(utils.arrayify(arguments)));
};
