var mime = require('simple-mime')();
var parseRange = require('range-parser');
var parseURL = require('./url').parse;
var unsupported = require('./utils').unsupported;

/**
 * Take formatted options and creates an Express style `req` object
 *
 * @param {Object} ghosttrain
 * @param {Object} options
 * @return {Object}
 */

function Request (ghosttrain, route, url, options) {
  // Headers info
  this.headers = options.headers || {};

  // Expose URL properties
  var parsedURL = parseURL(url, true);
  this.path = parsedURL.path;
  this.query = parsedURL.query;
  this.protocol = parsedURL.protocol;
  this.secure = this.protocol === 'https';
  
  this.route = route;
  this.method = route.method.toUpperCase();
  this.url = this.originalUrl = url;
  this.params = route.params;
  this.body = options.body || {};
  this.headers = options.headers || {};
}
module.exports = Request;

/**
 *
 * Parse Range header field,
 * capping to the given `size`.
 * 
 * Unspecified ranges such as "0-" require
 * knowledge of your resource length. In
 * the case of a byte range this is of course
 * the total number of bytes. If the Range
 * header field is not given `null` is returned,
 * `-1` when unsatisfiable, `-2` when syntactically invalid.
 * 
 * NOTE: remember that ranges are inclusive, so
 * for example "Range: users=0-3" should respond
 * with 4 users when available, not 3.
 * 
 * @param {Number} size
 * @return {Array}
 */

Request.prototype.range = function(size){
  var range = this.get('Range');
  if (!range) return;
  return parseRange(size, range);
};


/**
 * Check if the incoming request contains the "Content-Type"
 * header field, and it contains the give mime `type`.
 * 
 * Examples:
 * 
 * // With Content-Type: text/html; charset=utf-8
 * req.is('html');
 * req.is('text/html');
 * req.is('text/*');
 * // => true
 * 
 * // When Content-Type is application/json
 * req.is('json');
 * req.is('application/json');
 * req.is('application/*');
 * // => true
 * 
 * req.is('html');
 * // => false
 * 
 * @param {String} type
 * @return {Boolean}
 */

Request.prototype.is = function (type) {
  var ct = this.get('Content-Type');
  if (!ct) return false;
  ct = ct.split(';')[0];
  if (!~type.indexOf('/')) type = mime(type);
  if (~type.indexOf('*')) {
    type = type.split('/');
    ct = ct.split('/');
    if ('*' == type[0] && type[1] == ct[1]) return true;
    if ('*' == type[1] && type[0] == ct[0]) return true;
    return false;
  }
  return !!~ct.indexOf(type);
};

/**
 * Return request header `name`.
 *
 * @param {String} name
 * @return {String}
 */

Request.prototype.get = Request.prototype.header = function (name) {
  return this.headers[name];
};

/**
 * Return the value of param `name` when present or `defaultValue`.
 *
 *   - Checks route placeholders, ex: _/user/:id_
 *   - Checks body params, ex: id=12, {"id":12}
 *   - Checks query string params, ex: ?id=12
 *   
 * To utilize request bodies, `req.body`
 * should be an object. This can be done by using
 * the `connect.bodyParser()` middleware.
 * 
 * @param {String} name
 * @param {Mixed} [defaultValue]
 * @return {String}
 **/

Request.prototype.param = function (name, defaultValue) {
  var params = this.params || {};
  var body = this.body || {};
  var query = this.query || {};
  if (null != params[name] && params.hasOwnProperty(name)) return params[name];
  if (null != body[name]) return body[name];
  if (null != query[name]) return query[name];
  return defaultValue;
};

Object.__defineGetter__.call(Request.prototype, 'xhr', function() {
  return 'xmlhttprequest' === (this.get('X-Requested-With') || '').toLowerCase();
});

/**
 * Set up unsupported functions
 */
['accepts', 'acceptsEncoding', 'acceptsCharset', 'acceptsLanguage'].forEach(function (prop) {
  Request.prototype[prop] = unsupported('req.' + prop + '()');
});

/**
 * Set up unsupported getters
 */
['subdomains', 'stale', 'fresh', 'ip', 'ips', 'auth',
  'accepted', 'acceptedEncodings', 'acceptedCharsets', 'acceptedLanguages'].forEach(function (prop) {
  Object.__defineGetter__.call(Request.prototype, prop, unsupported('req.' + prop));
});
