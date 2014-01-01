require('./setup');
var GhostTrain = require('..');
var expect = require('expect.js');

describe('GhostTrain#request options', function () {
  /**
   * - `body` tested in `test.request.js`
   * - `headers` tested in `test.request.js`
   */

  describe('delay', function () {
    it('delays the execution of the route in milliseconds', function (done) {
      var gt = new GhostTrain();
      var flag = false;

      gt.get('/', function (req, res) {
        expect(flag).to.be.equal(true);
        res.send();
      });

      gt.request('get', '/', { delay: 300 }, done);

      setTimeout(function () {
        flag = true;
      }, 100);
    });
  });

  describe('contentType', function () {
    it('sets contentType', function (done) {
      var gt = new GhostTrain();

      gt.get('/', function (req, res) {
        expect(req.is('text/html')).to.be.equal(true);
        res.send();
      });

      gt.request('get', '/', {
        contentType: 'text/html'
      }, done);
    });
  });
});
