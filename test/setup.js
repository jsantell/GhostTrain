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
