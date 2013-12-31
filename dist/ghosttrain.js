!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.GhostTrain=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/ghosttrain');

},{"./lib/ghosttrain":2}],2:[function(require,module,exports){
var utils = require('./utils');
var Route = require('./route');
var send = require('./send');
var methods = require('./methods');

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

methods.forEach(function (verb) {
  if (verb === 'get') {
    GhostTrain.prototype.get = function () {
      if (arguments.length === 1)
        return this.settings[arguments[0]];
      else
        return addRoute('get').apply(this, utils.arrayify(arguments));
    };
  } else {
    GhostTrain.prototype[verb] = addRoute(verb);
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

GhostTrain.prototype.send = function () {
  return send.apply(null, [this].concat(utils.arrayify(arguments)));
};

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

},{"./methods":3,"./route":6,"./send":7,"./utils":9}],3:[function(require,module,exports){
// From https://github.com/visionmedia/node-methods
module.exports = [
  'get',
  'post',
  'put',
  'head',
  'delete',
  'options',
  'trace',
  'copy',
  'lock',
  'mkcol',
  'move',
  'propfind',
  'proppatch',
  'unlock',
  'report',
  'mkactivity',
  'checkout',
  'merge',
  'm-search',
  'notify',
  'subscribe',
  'unsubscribe',
  'patch',
  'search'
];

},{}],4:[function(require,module,exports){
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
  this.path = parsedURL.pathname;
  this.query = parsedURL.query;
  this.protocol = (parsedURL.protocol || window.location.protocol).replace(':', '');
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
  if (!type) return false;
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

},{"./url":8,"./utils":9,"range-parser":13,"simple-mime":14}],5:[function(require,module,exports){
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
  }

};

/**
 * Set up unsupported functions
 */
['clearCookie', 'cookie', 'attachment', 'jsonp', 'sendfile',
  'download', 'format', 'location', 'redirect', 'vary', 'render'].forEach(function (prop) {
  Response.prototype[prop] = unsupported('res.' + prop + '()');
});

},{"./utils":9,"simple-mime":14}],6:[function(require,module,exports){
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

},{"./utils":9}],7:[function(require,module,exports){
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

},{"./request":4,"./response":5,"./url":8}],8:[function(require,module,exports){
/**
 * Node.js's `url.parse` implementation from
 * https://github.com/isaacs/node-url/
 *
 * http://nodejs.org/api/url.html
 */

exports.parse = urlParse;

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9]+:)/,
    portPattern = /:[0-9]+$/,
    nonHostChars = ['/', '?', ';', '#'],
    hostlessProtocol = {
      'file': true,
      'file:': true
    },
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && typeof(url) === 'object' && url.href) return url;

  var out = { href: url },
      rest = url;

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    out.protocol = proto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      out.slashes = true;
    }
  }
  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {
    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    // don't enforce full RFC correctness, just be unstupid about it.
    var firstNonHost = -1;
    for (var i = 0, l = nonHostChars.length; i < l; i++) {
      var index = rest.indexOf(nonHostChars[i]);
      if (index !== -1 &&
          (firstNonHost < 0 || index < firstNonHost)) firstNonHost = index;
    }
    if (firstNonHost !== -1) {
      out.host = rest.substr(0, firstNonHost);
      rest = rest.substr(firstNonHost);
    } else {
      out.host = rest;
      rest = '';
    }

    // pull out the auth and port.
    var p = parseHost(out.host);
    var keys = Object.keys(p);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      out[key] = p[key];
    }
    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    out.hostname = out.hostname || '';
  }

  // now rest is set to the post-host stuff.
  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    out.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    out.search = rest.substr(qm);
    out.query = rest.substr(qm + 1);
    if (parseQueryString) {
      out.query = querystring.parse(out.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    out.query = {};
  }
  if (rest) out.pathname = rest;

  return out;
}

function parseHost(host) {
  var out = {};
  var at = host.indexOf('@');
  if (at !== -1) {
    out.auth = host.substr(0, at);
    host = host.substr(at + 1); // drop the @
  }
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    out.port = port.substr(1);
    host = host.substr(0, host.length - port.length);
  }
  if (host) out.hostname = host;
  return out;
}

},{"querystring":12}],9:[function(require,module,exports){
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
  if (toString.call(path) == '[object RegExp]') return path;
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

},{}],10:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],12:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":10,"./encode":11}],13:[function(require,module,exports){

/**
 * Parse "Range" header `str` relative to the given file `size`.
 *
 * @param {Number} size
 * @param {String} str
 * @return {Array}
 * @api public
 */

module.exports = function(size, str){
  var valid = true;
  var i = str.indexOf('=');

  if (-1 == i) return -2;

  var arr = str.slice(i + 1).split(',').map(function(range){
    var range = range.split('-')
      , start = parseInt(range[0], 10)
      , end = parseInt(range[1], 10);

    // -nnn
    if (isNaN(start)) {
      start = size - end;
      end = size - 1;
    // nnn-
    } else if (isNaN(end)) {
      end = size - 1;
    }

    // limit last-byte-pos to current length
    if (end > size - 1) end = size - 1;

    // invalid
    if (isNaN(start)
      || isNaN(end)
      || start > end
      || start < 0) valid = false;

    return {
      start: start,
      end: end
    };
  });

  arr.type = str.slice(0, i);

  return valid ? arr : -1;
};
},{}],14:[function(require,module,exports){
// A simple mime database.
var types;
module.exports = function setup(defaultMime) {
  return function getMime(path) {
    path = path.toLowerCase().trim();
    var index = path.lastIndexOf("/");
    if (index >= 0) {
      path = path.substr(index + 1);
    }
    index = path.lastIndexOf(".");
    if (index >= 0) {
      path = path.substr(index + 1);
    }
    return types[path] || defaultMime;
  };
};

// Borrowed and passed around from who knows where, last grabbed from connect.
types = {
  "3gp": "video/3gpp",
  a: "application/octet-stream",
  ai: "application/postscript",
  aif: "audio/x-aiff",
  aiff: "audio/x-aiff",
  asc: "application/pgp-signature",
  asf: "video/x-ms-asf",
  asm: "text/x-asm",
  asx: "video/x-ms-asf",
  atom: "application/atom+xml",
  au: "audio/basic",
  avi: "video/x-msvideo",
  bat: "application/x-msdownload",
  bin: "application/octet-stream",
  bmp: "image/bmp",
  bz2: "application/x-bzip2",
  c: "text/x-csrc",
  cab: "application/vnd.ms-cab-compressed",
  can: "application/candor",
  cc: "text/x-c++src",
  chm: "application/vnd.ms-htmlhelp",
  "class": "application/octet-stream",
  com: "application/x-msdownload",
  conf: "text/plain",
  cpp: "text/x-c",
  crt: "application/x-x509-ca-cert",
  css: "text/css",
  csv: "text/csv",
  cxx: "text/x-c",
  deb: "application/x-debian-package",
  der: "application/x-x509-ca-cert",
  diff: "text/x-diff",
  djv: "image/vnd.djvu",
  djvu: "image/vnd.djvu",
  dll: "application/x-msdownload",
  dmg: "application/octet-stream",
  doc: "application/msword",
  dot: "application/msword",
  dtd: "application/xml-dtd",
  dvi: "application/x-dvi",
  ear: "application/java-archive",
  eml: "message/rfc822",
  eps: "application/postscript",
  exe: "application/x-msdownload",
  f: "text/x-fortran",
  f77: "text/x-fortran",
  f90: "text/x-fortran",
  flv: "video/x-flv",
  "for": "text/x-fortran",
  gem: "application/octet-stream",
  gemspec: "text/x-script.ruby",
  gif: "image/gif",
  gyp: "text/x-script.python",
  gypi: "text/x-script.python",
  gz: "application/x-gzip",
  h: "text/x-chdr",
  hh: "text/x-c++hdr",
  htm: "text/html",
  html: "text/html",
  ico: "image/vnd.microsoft.icon",
  ics: "text/calendar",
  ifb: "text/calendar",
  iso: "application/octet-stream",
  jar: "application/java-archive",
  java: "text/x-java-source",
  jnlp: "application/x-java-jnlp-file",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  less: "text/css",
  log: "text/plain",
  lua: "text/x-script.lua",
  luac: "application/x-bytecode.lua",
  makefile: "text/x-makefile",
  m3u: "audio/x-mpegurl",
  m4v: "video/mp4",
  man: "text/troff",
  manifest: "text/cache-manifest",
  markdown: "text/x-markdown",
  mathml: "application/mathml+xml",
  mbox: "application/mbox",
  mdoc: "text/troff",
  md: "text/x-markdown",
  me: "text/troff",
  mid: "audio/midi",
  midi: "audio/midi",
  mime: "message/rfc822",
  mml: "application/mathml+xml",
  mng: "video/x-mng",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  mp4v: "video/mp4",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  ms: "text/troff",
  msi: "application/x-msdownload",
  odp: "application/vnd.oasis.opendocument.presentation",
  ods: "application/vnd.oasis.opendocument.spreadsheet",
  odt: "application/vnd.oasis.opendocument.text",
  ogg: "application/ogg",
  p: "text/x-pascal",
  pas: "text/x-pascal",
  pbm: "image/x-portable-bitmap",
  pdf: "application/pdf",
  pem: "application/x-x509-ca-cert",
  pgm: "image/x-portable-graymap",
  pgp: "application/pgp-encrypted",
  pkg: "application/octet-stream",
  pl: "text/x-script.perl",
  pm: "text/x-script.perl-module",
  png: "image/png",
  pnm: "image/x-portable-anymap",
  ppm: "image/x-portable-pixmap",
  pps: "application/vnd.ms-powerpoint",
  ppt: "application/vnd.ms-powerpoint",
  ps: "application/postscript",
  psd: "image/vnd.adobe.photoshop",
  py: "text/x-script.python",
  qt: "video/quicktime",
  ra: "audio/x-pn-realaudio",
  rake: "text/x-script.ruby",
  ram: "audio/x-pn-realaudio",
  rar: "application/x-rar-compressed",
  rb: "text/x-script.ruby",
  rdf: "application/rdf+xml",
  roff: "text/troff",
  rpm: "application/x-redhat-package-manager",
  rss: "application/rss+xml",
  rtf: "application/rtf",
  ru: "text/x-script.ruby",
  s: "text/x-asm",
  sgm: "text/sgml",
  sgml: "text/sgml",
  sh: "application/x-sh",
  sig: "application/pgp-signature",
  snd: "audio/basic",
  so: "application/octet-stream",
  svg: "image/svg+xml",
  svgz: "image/svg+xml",
  swf: "application/x-shockwave-flash",
  t: "text/troff",
  tar: "application/x-tar",
  tbz: "application/x-bzip-compressed-tar",
  tci: "application/x-topcloud",
  tcl: "application/x-tcl",
  tex: "application/x-tex",
  texi: "application/x-texinfo",
  texinfo: "application/x-texinfo",
  text: "text/plain",
  tif: "image/tiff",
  tiff: "image/tiff",
  torrent: "application/x-bittorrent",
  tr: "text/troff",
  ttf: "application/x-font-ttf",
  txt: "text/plain",
  vcf: "text/x-vcard",
  vcs: "text/x-vcalendar",
  vrml: "model/vrml",
  war   : "application/java-archive",
  wav   : "audio/x-wav",
  webapp: "application/x-web-app-manifest+json",
  webm: "video/webm",
  wma: "audio/x-ms-wma",
  wmv: "video/x-ms-wmv",
  wmx: "video/x-ms-wmx",
  wrl: "model/vrml",
  wsdl: "application/wsdl+xml",
  xbm: "image/x-xbitmap",
  xhtml: "application/xhtml+xml",
  xls: "application/vnd.ms-excel",
  xml: "application/xml",
  xpm: "image/x-xpixmap",
  xsl: "application/xml",
  xslt: "application/xslt+xml",
  yaml: "text/yaml",
  yml: "text/yaml",
  zip: "application/zip"
};


},{}]},{},[1])
(1)
});