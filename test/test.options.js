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

    it('takes precedence over instance delay options', function (done) {
      var gt = new GhostTrain();
      var flag = 0;
      gt.set('delay', 200);

      gt.get('/', function (req, res) {
        expect(flag).to.be.equal(50);
        res.send();
      });

      gt.request('get', '/', { delay: 100 }, done);
      
      setTimeout(function () { flag = 50; }, 50);
      setTimeout(function () { flag = 250; }, 250);
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

describe('GhostTrain instance options', function () {
  describe('ghosttrain.set("delay")', function () {
    it('sets delay of the request on all requests', function (done) {
      var gt = new GhostTrain();
      gt.set('delay', 100);
      var flag = 0;

      gt.get('/', function (req, res) {
        expect(flag).to.be.equal(50);
        res.send();
      });

      gt.request('get', '/', done);
      
      setTimeout(function () { flag = 50; }, 50);
    });
  });
});
