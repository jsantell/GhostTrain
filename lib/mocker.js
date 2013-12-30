var utils = require('./utils');
var Route = require('./route');
var send = require('./send');

/**
 * Mocker constructor
 *
 */

function Mocker () {
  this.routes = {
    'get': [],
    'post': [],
    'put': [],
    'delete': [],
    '*': []
  };

  this.settings = {
    'case sensitive routing': false,
    'strict routing': false,
    'json replacer': undefined,
    'json spaces': undefined
  };
}
module.exports = Mocker;

['post', 'put', 'delete'].forEach(function (verb) {
  Mocker.prototype[verb] = addRoute(verb);
});

Mocker.prototype.get = function () {
  if (arguments.length === 1)
    return this.settings[arguments[0]];
  else
    return addRoute('get').apply(this, Array.prototype.slice.call(arguments, 0));
};

/**
 * Set a configuration setting on the Mocker instance
 *
 * @param {String} key
 * @param {Mixed} value
 */

Mocker.prototype.set = function (key, value) {
  this.settings[key] = value;
};

/**
 * Set a configuration setting on the Mocker instance to `true`
 *
 * @param {String} key
 */

Mocker.prototype.enable = function (key) {
  this.settings[key] = true;
};

/**
 * Set a configuration setting on the Mocker instance to `false`
 *
 * @param {String} key
 */

Mocker.prototype.enable = function (key) {
  this.settings[key] = false;
};

/**
 * Mocker#sync returns a function that can be used in place of `Backbone.sync`,
 * mimicking the formatting before sending off the HTTP request but calling
 * a mock route instead.
 *
 * @return {Function}
 */

Mocker.prototype.sync = function () {
  var mocker = this;
  return function sync (method, model, options) {
    var type = utils.methodMap[method];

    // Default JSON-request options.
    var params = {
      type: type,
      dataType: 'json'
    };

    // Ensure that we have a URL.
    if (!options.url)
      params.url = utils.getURL(model) || utils.urlError();

    // Ensure that we have the appropriate request data.
    if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
      params.contentType = 'application/json';
      params.data = JSON.stringify(options.attrs || model.toJSON(options));
    }

    var route = mocker.findRoutes(type, options.url || params.url)[0];

    var reqOptions = {
      params: route.params,
      body: JSON.stringify(params || '{}')
    };

    return send(mocker, route, reqOptions)
      .then(function (data) {
        if (options.success)
          options.success.call(model, data);
      }, function (err) {
        if (options.error)
          options.error.call(model, err);
        // Keep the error propagated
        throw new Error(err);
      });
  };
};

/**
 * Mocker#findRoutes takes a verb and a path and returns an array of all
 * routes that match the request
 *
 * @param {String} verb
 * @param {Path} verb
 * @return {Array}
 */

Mocker.prototype.findRoutes = function (verb, path) {
  var routes = this.routes[verb];
  var matchedRoutes = routes.reduce(function (matching, route) {
    if (route.match(path))
      matching.push(route);
    return matching;
  }, []);

  return matchedRoutes;
};

function addRoute (verb) {
  return function (path, fn) {
    this.routes[verb].push(new Route(verb, path, fn, {
      sensitive: this.settings['case sensitive routing'],
      strict: this.settings['strict routing']
    }));
  };
}
