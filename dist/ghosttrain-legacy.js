/**
 * Shims newer APIs on native objects for legacy browsers:
 *
 * Array#indexOf
 * Array#map
 * Array#forEach
 * Array.isArray
 * String#trim
 * Object.keys
 */

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function(elt /*, from*/) {
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0)
      ? Math.ceil(from)
      : Math.floor(from);
    if (from < 0)
      from += len;

    for (; from < len; from++) {
      if (from in this &&
          this[from] === elt)
        return from;
    }
    return -1;
  };
}

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fun /*, thisArg */) {
    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t)
        fun.call(thisArg, t[i], i, t);
    }
  };
}

if (!Array.prototype.map) {
  Array.prototype.map = function(fun /*, thisArg */) {
    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = new Array(len);
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      // NOTE: Absolute correctness would demand Object.defineProperty
      // be used.  But this method is fairly new, and failure is
      // possible only if Object.prototype or Array.prototype
      // has a property |i| (very unlikely), so use a less-correct
      // but more portable alternative.
      if (i in t)
        res[i] = fun.call(thisArg, t[i], i, t);
    }

    return res;
  };
}

if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/gm, '');
  };
}

if (!Array.isArray) {
  Array.isArray = function (vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
      hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
      dontEnums = [
        'toString',
        'toLocaleString',
        'valueOf',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'constructor'
      ],
      dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }
  
      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }

      return result;
    };
  }());
}
/*
    json2.js
    2013-05-26

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.GhostTrain=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = require('./lib/ghosttrain');

},{"./lib/ghosttrain":3}],2:[function(require,module,exports){
/**
 * Wraps `Object.defineProperty` for browsers that support it,
 * and fails silently if unsupported.
 *
 * @param {Object} object
 * @param {String} prop
 * @param {Function} func
 */

exports.get = function get (obj, prop, func) {
  if (Object.defineProperty) {
    // Wrap in `try` since IE8 has `defineProperty` but only works
    // on DOM nodes
    try {
      Object.defineProperty(obj, prop, {
        get: func
      });
    } catch (e) {}
  }
};

/**
 * Returns a boolean indicating getter support.
 *
 * @return {Boolean}
 */

exports.isSupported = function isSupported () {
  var obj = {};
  exports.get(obj, 'supported', function () { return true });
  return obj.supported;
};

},{}],3:[function(require,module,exports){
var utils = require('./utils');
var sendRequest = require('./sendRequest');
var methods = require('./methods');

/**
 * GhostTrain constructor
 */

function GhostTrain () {
  this.routes = {};

  this.settings = {
    'delay': 0,
    'debug': false,
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

GhostTrain.prototype.disable = function (key) {
  this.settings[key] = false;
};

/**
 * Makes a request to the routing service.
 */

GhostTrain.prototype.request = function () {
  return sendRequest.apply(null, [this].concat(utils.arrayify(arguments)));
};

},{"./methods":4,"./sendRequest":8,"./utils":10}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
var mime = require('simple-mime')();
var parseRange = require('range-parser');
var parseURL = require('./url').parse;
var unsupported = require('./utils').unsupported;
var requestURL = require('./utils').requestURL;
var get = require('./get').get;

/**
 * Take formatted options and creates an Express style `req` object.
 * Takes an url `String` or an already parsed (via `./lib/url`.parse) object.
 *
 * @param {GhostTrain} ghosttrain
 * @param {Route} route
 * @param {Object|String} url
 * @param {Object} options
 * @return {Request}
 */

function Request (ghosttrain, route, url, options) {
  // Headers info
  this.headers = options.headers || {};

  // Allows us to check protocol of client-side requests,
  // but relative requests won't have a protocol
  var protocol = 'window' in this ? window.location.protocol : '';

  // Expose URL properties
  var parsedURL = url.pathname ? url : parseURL(url, true);
  this.path = parsedURL.pathname;
  this.query = parsedURL.query;
  this.protocol = (parsedURL.protocol || protocol).replace(':', '');
  this.secure = this.protocol === 'https';

  this.route = route;
  this.method = route.method.toUpperCase();
  this.url = this.originalUrl = requestURL(parsedURL);
  this.params = route.params;
  this.body = options.body || {};
  this.headers = options.headers || {};

  this.xhr = 'xmlhttprequest' === (this.get('X-Requested-With') || '').toLowerCase();
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

/**
 * Set up unsupported functions
 */
['accepts', 'acceptsEncoding', 'acceptsCharset', 'acceptsLanguage'].forEach(function (prop) {
  Request.prototype[prop] = unsupported('req.' + prop + '()');
});

/**
 * Set up unsupported getters; on browsers that do not support getters, just
 * ignore and do not throw errors as this is only a "nice to have" feature
 */
['subdomains', 'stale', 'fresh', 'ip', 'ips', 'auth',
   'accepted', 'acceptedEncodings', 'acceptedCharsets',
   'acceptedLanguages'].forEach(function (prop) {
  get(Request.prototype, prop, unsupported('req.' + prop));
});

},{"./get":2,"./url":9,"./utils":10,"range-parser":14,"simple-mime":15}],6:[function(require,module,exports){
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

},{"./utils":10,"simple-mime":15}],7:[function(require,module,exports){
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

},{"./utils":10}],8:[function(require,module,exports){
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

},{"./request":5,"./response":6,"./url":9,"./utils":10}],9:[function(require,module,exports){
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

},{"querystring":13}],10:[function(require,module,exports){
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

},{"./route":7,"./url":9}],11:[function(require,module,exports){
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
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

},{}],12:[function(require,module,exports){
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
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
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

},{}],13:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":11,"./encode":12}],14:[function(require,module,exports){

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
},{}],15:[function(require,module,exports){
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