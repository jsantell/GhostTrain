var Request = require('./request');
var Response = require('./response');
var parseURL = require('./url').parse;
var clone = require('./utils').clone;
var findRoute = require('./utils').findRoute;
var debug = require('./utils').debug;

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
 *   - {Object} headers: Object of pairings of header values
 *   - {String} contentType: Sets headers for `Content-Type`
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

  // Clones if `params` is an object
  var options = clone(params);

  // Set up headers
  if (!options.headers)
    options.headers = {};
  if (options.contentType)
    options.headers['Content-Type'] = options.contentType;

  // We take out all the host information from the URL so we can match it
  var parsedURL = parseURL(url, true);
  var route = findRoute(ghosttrain, verb, parsedURL);

  reqDebug(ghosttrain, 'REQ', verb, url);

  function execute () {
    if (route) {
      req = new Request(ghosttrain, route, parsedURL, options);
      res = new Response(ghosttrain, success);
      route.callback(req, res);
    } else {
      if (callback)
        callback('404: No route found.', null, null);
    }
  }

  // Ensure the processing is asynchronous
  setTimeout(execute, options.delay || ghosttrain.get('delay') || 0);

  function success (data) {
    var response = render(req, res, data);
    reqDebug(ghosttrain, 'RES', verb, url, response);
    if (!callback) return;

    // TODO error handling from router
    callback(null, response, data);
  }
}
module.exports = send;

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

function reqDebug (gt, type, verb, url, response) {
  debug(gt, type + ' ' + verb.toUpperCase() + ' ' + url, response)
}
