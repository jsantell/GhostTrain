var when = require('when');
var Request = require('./request');
var Response = require('./response');

function send (mocker, route, options) {
  var deferred = when.defer();
  var req, res;

  if (route) {
    req = new Request(mocker, options);
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
