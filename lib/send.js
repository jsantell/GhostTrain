var when = require('when');
var Request = require('./request');
var Response = require('./response');

function send (mocker, routes, params) {
  var deferred = when.defer();
  var route = routes[0]
  var req, res;

  if (route) {
    req = new Request(mocker, route, params);
    res = new Response(mocker, success);
    route.callback(req, res);
  } else {
    deferred.reject();
  }

  function success (message) {
    if (res.statusCode !== 200)
      deferred.reject(message);
    else
      deferred.resolve(message);
  }

  return deferred.promise;
}
module.exports = send;
