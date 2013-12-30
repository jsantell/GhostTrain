var utils = require('./utils');

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

  this.statusCode = 200;

  this.app = ghosttrain;
  this.end = callback;
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
    if (typeof arguments[0] === 'number') {
      this.status(arguments[0]);
      body = arguments[1];
    } else {
      body = arguments[0];
    }

    if (!body)
      body = utils.STATUS_CODES[this.statusCode];

    console.log(body);
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

    var app = this.app;
    var replacer = app.get('json replacer');
    var spaces = app.get('json spaces');
    var body = JSON.stringify(data, replacer, spaces);

    return this.send(body);
  },

  jsonp: function () {
    throw new Error('res.jsonp not yet supported');
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

  set: function (field, value) {},
  get: function (field) {},
  cookie: function (name, value, options) {},
  clearCookie: function (name, options) {},
  redirect: function (status, url) {},
  location: function () {},
};
