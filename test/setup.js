/**
 * This is added to test bundle to shim features used in the test frameworks (Chai)
 * to allow support for older browsers (IE8).
 *
 */

if (!Object.create) {
  Object.create = (function(){
    function F(){}

    return function(o){
      if (arguments.length != 1) {
        throw new Error('Object.create implementation only accepts one parameter.');
      }
      F.prototype = o;
      return new F();
    };
  })();
}

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
