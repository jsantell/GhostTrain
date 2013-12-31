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
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
};

/**
 * Returns a boolean indicating getter support.
 *
 * @return {Boolean}
 */

exports.isSupported = function isSupported () {
  return exports.get({}, 'supported', function (){});
};
