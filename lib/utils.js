var Route = require('./route');
var parseURL = require('./url').parse;

/**
 * Prints out debugging to console if `ghosttrain.get('debug')` is true
 * 
 * @param {GhostTrain} gt
 * @param {String} out
 */

function debug (gt) {
  var args = arrayify(arguments);
  args.splice(0, 1); // Pop first `gt` argument
  if (gt.get('debug'))
    console.log.apply(console, ['GhostTrain debug: '].concat(args));
}
exports.debug = debug;

/**
 * `findRoute` takes a verb and a `url` and returns a matching
 * GhostTrain.Route, or `null` if no matches. `url` can be a string
 * that gets parsed, or an already parsed (./lib/url#parse) URL object.
 *
 * @param {GhostTrain} ghosttrain
 * @param {String} verb
 * @param {String|Object} url
 * @return {Route|null}
 */

function findRoute (ghosttrain, verb, url) {
  // Extract path from the object or string
  var path = url.pathname ? url.pathname : parseURL(url);

  var routes = ghosttrain.routes[verb.toLowerCase()];
  if (!routes) return null;
  for (var i = 0; i < routes.length; i++)
    if (routes[i].match(path))
      return routes[i];
  return null;
};
exports.findRoute = findRoute;

/**
 * Clones an object properties onto a new object
 *
 * @param {Object} obj
 * @return {Object}
 */

function clone (obj) {
  var newObj = {};

  // Return a new obj if no `obj` passed in
  if (!obj || typeof obj !== 'object' || Array.isArray(obj))
    return newObj;

  for (var prop in obj)
    newObj[prop] = obj[prop];
  return newObj;
}
exports.clone = clone;

/**
 * Turns a url string or a parsed url object (./lib/url#parse)
 * into a string of the URL with host/port/protocol info stripped
 *
 * requestURL('http://localhost:9999/search?q=myquery'); // '/search?q=myquery'
 *
 * @param {String|Object} url
 * @return {String}
 */

function requestURL (url) {
  var parsedURL = url.pathname ? url : parseURL(url, true);

  return parsedURL.pathname + (parsedURL.search || '');
}
exports.requestURL = requestURL;

/**
 * Returns a function that acts as `app.VERB(path, route)`; helper function
 * used in `./lib/ghosttrain.js`.
 *
 * @param {String} verb
 * @return {Function{
 */

function addRoute (verb) {
  return function (path, fn) {
    // Support all HTTP verbs
    if (!this.routes[verb])
      this.routes[verb] = [];

    this.routes[verb].push(new Route(verb, path, fn, {
      sensitive: this.settings['case sensitive routing'],
      strict: this.settings['strict routing']
    }));
  };
}
exports.addRoute = addRoute;

/**
 * A function that takes a `name` that returns a function
 * that throws an error regarding an unsupported function of `name`,
 * to be called when invoking an unsupported function.
 *
 * @param {String} name
 * @return {Function}
 */

function unsupported (name) {
  return function () {
    throw new Error('`' + name + '` is currently unsupported');
  };
}
exports.unsupported = unsupported;

/**
 * Arrayify `arguments`
 *
 * @param {Argument} args
 * @return {Array}
 */

function arrayify (args) {
 return Array.prototype.slice.call(args, 0);
}
exports.arrayify = arrayify;

/**
 * From Express:
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp|Array} path
 * @param  {Array} keys
 * @param  {Boolean} sensitive
 * @param  {Boolean} strict
 * @return {RegExp}
 */

function pathRegexp (path, keys, sensitive, strict) {
  if (Object.prototype.toString.call(path) == '[object RegExp]') return path;
  if (Array.isArray(path)) path = '(' + path.join('|') + ')';

  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');

  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
}
exports.pathRegexp = pathRegexp;

/**
 * Status codes from Node core
 * https://github.com/joyent/node/blob/master/lib/_http_server.js
 */

var STATUS_CODES = exports.STATUS_CODES = {
  100 : 'Continue',
  101 : 'Switching Protocols',
  102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
  200 : 'OK',
  201 : 'Created',
  202 : 'Accepted',
  203 : 'Non-Authoritative Information',
  204 : 'No Content',
  205 : 'Reset Content',
  206 : 'Partial Content',
  207 : 'Multi-Status',               // RFC 4918
  300 : 'Multiple Choices',
  301 : 'Moved Permanently',
  302 : 'Moved Temporarily',
  303 : 'See Other',
  304 : 'Not Modified',
  305 : 'Use Proxy',
  307 : 'Temporary Redirect',
  400 : 'Bad Request',
  401 : 'Unauthorized',
  402 : 'Payment Required',
  403 : 'Forbidden',
  404 : 'Not Found',
  405 : 'Method Not Allowed',
  406 : 'Not Acceptable',
  407 : 'Proxy Authentication Required',
  408 : 'Request Time-out',
  409 : 'Conflict',
  410 : 'Gone',
  411 : 'Length Required',
  412 : 'Precondition Failed',
  413 : 'Request Entity Too Large',
  414 : 'Request-URI Too Large',
  415 : 'Unsupported Media Type',
  416 : 'Requested Range Not Satisfiable',
  417 : 'Expectation Failed',
  418 : 'I\'m a teapot',              // RFC 2324
  422 : 'Unprocessable Entity',       // RFC 4918
  423 : 'Locked',                     // RFC 4918
  424 : 'Failed Dependency',          // RFC 4918
  425 : 'Unordered Collection',       // RFC 4918
  426 : 'Upgrade Required',           // RFC 2817
  428 : 'Precondition Required',      // RFC 6585
  429 : 'Too Many Requests',          // RFC 6585
  431 : 'Request Header Fields Too Large',// RFC 6585
  500 : 'Internal Server Error',
  501 : 'Not Implemented',
  502 : 'Bad Gateway',
  503 : 'Service Unavailable',
  504 : 'Gateway Time-out',
  505 : 'HTTP Version Not Supported',
  506 : 'Variant Also Negotiates',    // RFC 2295
  507 : 'Insufficient Storage',       // RFC 4918
  509 : 'Bandwidth Limit Exceeded',
  510 : 'Not Extended',               // RFC 2774
  511 : 'Network Authentication Required' // RFC 6585
};
