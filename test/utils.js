var GhostTrain = require('../');
var requestURL = require('../lib/utils').requestURL;

function testMiddleware (method, routeURL, reqURL, callback) {
  var gt = new GhostTrain();
  // `method, routeURL, callback`
  if (typeof reqURL === 'function') {
    callback = reqURL;
    reqURL = routeURL;
  }

  gt[method.toLowerCase()](routeURL, callback);

  gt.request(method, reqURL, function () {});
}
exports.testMiddleware = testMiddleware;

function run (method, url, route, callback) {
  // route, callback
  if (arguments.length <= 2) {
    route = method;
    callback = url;
    method = 'get';
    url = '/';
  }

  // Strip out absolute URL portion
  var path = requestURL(url);

  var gt = new GhostTrain();
  gt[method.toLowerCase()](path, route);
  gt.request(method, url, callback);
}
exports.run = run;
