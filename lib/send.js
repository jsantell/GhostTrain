var Request = require('./request');
var Response = require('./response');
var parseURL = require('./url').parse;

/**
 * Called from `GhostTrain#send`, makes the request via the routing service.
 * Takes a verb, url, optional params, and a callback that passes in an `err` object
 * and the data response from the router.
 *
 * @param {GhostTrain} ghosttrain
 * @param {String} verb
 * @param {String} url
 * @param {Object} (params)
 *   - {Number} delay: Number of ms to wait before executing routing (default: 0)
 *   - {Object} body: Object representing POST body data (default: {})
 * @param {Function} callback
 */

function send (ghosttrain, verb, url, params, callback) {
  var req, res;

  verb = verb.toLowerCase();

  // Allow `params` to be optional
  if (typeof arguments[3] === 'function') {
    callback = params;
    params = {};
  }

  // Allow optional `params` and `callback`
  if (!params)
    params = {};

  var route = findRoute(ghosttrain, verb, url);

  function execute () {
    if (route) {
      req = new Request(ghosttrain, route, url, params);
      res = new Response(ghosttrain, success);
      route.callback(req, res);
    } else {
      if (callback)
        callback('404: No route found.', null, null);
    }
  }

  // Ensure the processing is asynchronous
  setTimeout(execute, params.delay || 1);

  function success (data) {
    if (!callback) return;
    if (res.statusCode !== 200)
      callback(data, render(req, res, data), null);
    else
      callback(null, render(req, res, data), data);
  }
}
module.exports = send;

/**
 * `findRoute` takes a verb and a path and returns a matching
 * GhostTrain.Route, or `null` if no matches.
 *
 * @param {String} verb
 * @param {Path} verb
 * @return {Route|null}
 */

function findRoute (ghosttrain, verb, path) {
  var routes = ghosttrain.routes[verb];
  if (!routes) return null;
  for (var i = 0; i < routes.length; i++)
    if (routes[i].match(path))
      return routes[i];
  return null;
};

/**
 * Takes a request, response and body object and return a response object
 * for the `send` callback.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Object|String} body
 * @return {Object}
 */

function render (req, res, body) {
  var response = {};
  var parsedURL = parseURL(req.url);

  // Append URL properties
  for (var prop in parsedURL)
    response[prop] = parsedURL[prop];

  // Append select `req` properties
  ['method', 'url'].forEach(function (prop) {
    response[prop] = req[prop];
  });

  // Append select `res` properties
  ['headers', 'statusCode'].forEach(function (prop) {
    response[prop] = res[prop];
  });

  response.body = body;

  return response;
}
