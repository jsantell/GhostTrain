var utils = require('./utils');

/**
 * Mostly from Express' router `Route`.
 *
 * Initialize `Route` with the given HTTP `method`, `path`,
 * and an array of `callbacks` and `options`.
 *
 * Options:
 *
 *   - `sensitive`    enable case-sensitive routes
 *   - `strict`       enable strict matching for trailing slashes
 *
 * @param {String} method
 * @param {String} path
 * @param {Array} callbacks
 * @param {Object} options
 */

function Route (method, path, callback, options) {
  this.path = path;
  this.method = method;
  this.callback = callback;
  this.regexp = utils.pathRegexp(path, this.keys = [], options.sensitive, options.strict);
}
module.exports = Route;

/**
 * Check if this route matches `path`, if so
 * populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 */

Route.prototype.match = function(path){
  var keys = this.keys;
  var params = this.params = [];

  var m = this.regexp.exec(path);

  if (!m) return false;

  for (var i = 1, len = m.length; i < len; ++i) {
    var key = keys[i - 1];

    try {
      var val = 'string' == typeof m[i]
        ? decodeURIComponent(m[i])
        : m[i];
    } catch(e) {
      var err = new Error("Failed to decode param '" + m[i] + "'");
      err.status = 400;
      throw err;
    }

    if (key)
      params[key.name] = val;
    else
      params.push(val);
  }

  return true;
};
