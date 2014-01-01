var mime = require('simple-mime')();
var utils = require('./utils');
var unsupported = utils.unsupported;

/**
 * Shims features of Express's `response` object in routes.
 * Accepts a `callback` function to be called with the data to send.
 *
 * @param {Object} ghosttrain
 * @param {Function} callback
 * @return {Object}
 */

function Response (ghosttrain, callback) {
  this.charset = '';
  this.headers = {};
  this.statusCode = 200;

  this.app = ghosttrain;
  this._callback = callback;
}
module.exports = Response;

Response.prototype = {

  /**
   * Sends a response
   *
   * Examples:
   *   res.send({})
   *   res.send('text')
   *   res.send(404, 'Message')
   *   res.send(200)
   *
   * @param {Mixed} body or status code
   * @param {Mixed} body
   * @return {Response}
   */

  send: function () {
    var body;
    var app = this.app;

    // If status provide, set that, and set `body` to the content correctly
    if (typeof arguments[0] === 'number') {
      this.status(arguments[0]);
      body = arguments[1];
    } else {
      body = arguments[0];
    }

    var type = this.get('Content-Type');

    if (!body && type !== 'application/json') {
      body = utils.STATUS_CODES[this.statusCode];
      if (!type)
        this.type('txt');
    }
    else if (typeof body === 'string') {
      if (!type) {
        this.charset = this.charset || 'utf-8';
        this.type('html');
      }
    }
    else if (typeof body === 'object') {
      if (body === null)
        body = '';
      else if (!type || type === 'application/json') {
        this.contentType('application/json');
        // Cast object to string to normalize response
        var replacer = app.get('json replacer');
        var spaces = app.get('json spaces');
        body = JSON.stringify(body, replacer, spaces);
      }
    }

    this.end(body);
    return this;
  },

  /**
   * Sends a JSON response
   *
   * Examples:
   *   res.json(null);
   *   res.json({});
   *   res.json(200, 'text');
   *   res.json(404, 'woops');
   *
   * @param {Mixed} body or status code
   * @param {Mixed} object data
   * @return {Response}
   */

  json: function () {
    var data;
    if (arguments.length === 2) {
      this.status(arguments[0]);
      data = arguments[1];
    } else {
      data = arguments[0];
    }

    if (!this.get('Content-Type'))
      this.contentType('application/json');

    return this.send(data);
  },

  /**
   * Sets status `code`
   *
   * @param {Number} code
   * @return {Response}
   */

  status: function (code) {
    this.statusCode = code;
    return this;
  },

  /**
   * Sets `field` header to `value`, or accepts an object and applies
   * those key value pairs to the Response object's headers.
   *
   * @param {String|Object} field
   * @param {String} value
   * @return {Response}
   */

  set: function (field, value) {
    if (arguments.length === 2)
      this.headers[field] = value;
    else {
      for (var prop in field)
        this.headers[prop] = field[prop];
    }
    return this;
  },

  /**
   * Alias for `res.set`.
   */

  header: function (field, value) {
    return this.set(field, value);
  },

  /**
   * Gets header value of `field`
   *
   * @param {String} field
   * @return {String}
   */

  get: function (field) {
    return this.headers[field];
  },

  /**
   * Set Link header field with the given `links`.
   *
   * Examples:
   *
   *   res.links({
   *     next: 'http://api.example.com/users?page=2',
   *     last: 'http://api.example.com/users?page=5'
   *   });
   *
   * @param {Object} links
   * @return {Response}
   */

  links: function (links){
    var link = this.get('Link') || '';
    if (link) link += ', ';
    return this.set('Link', link + Object.keys(links).map(function(rel){
      return '<' + links[rel] + '>; rel="' + rel + '"';
    }).join(', '));
  },

  /**
   * Set _Content-Type_ response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the Content-Type to `type` otherwise.
   *
   * Examples:
   *
   *   res.type('.html');
   *   res.type('html');
   *   res.type('json');
   *   res.type('application/json');
   *   res.type('png');
   *
   * @param {String} type
   * @return {Response}
   */

  contentType: function (type) {
    return this.set('Content-Type', ~type.indexOf('/')
      ? type
      : mime(type));
  },

  /**
   * Alias for `res.contentType`
   */

  type: function (type) {
    return this.contentType(type);
  },

  /**
   * Formats response and calls initial callback
   *
   * @param {String} body
   */

  end: function (body) {
    var type = this.get('Content-Type');

    if (type === 'application/json')
      this._callback(JSON.parse(body || '{}'));
    else
      this._callback(body);
  }

};

/**
 * Set up unsupported functions
 */
['clearCookie', 'cookie', 'attachment', 'jsonp', 'sendfile',
  'download', 'format', 'location', 'redirect', 'vary', 'render'].forEach(function (prop) {
  Response.prototype[prop] = unsupported('res.' + prop + '()');
});
