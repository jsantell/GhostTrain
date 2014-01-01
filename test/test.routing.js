require('./setup');
var GhostTrain = require('..');
var expect = require('chai').expect;

describe('Routing', function () {
  describe('GhostTrain#VERB', function () {
    ['GET', 'POST', 'PUT', 'DELETE'].forEach(function (method) {
      it('GhostTrain#' + method.toLowerCase() + '(path, callback)', function (done) {
        var gt = new GhostTrain();

        gt[method.toLowerCase()]('/users', function (req, res) {
          res.send('response');
        });

        gt.request(method, '/users', function (err, res, data) {
          expect(err).to.be.not.ok;
          expect(data).to.be.equal('response');
          done();
        });
      });
    });
  });

  describe('General Routing', function () {
    it('uses best matching route', function (done) {
      var gt = new GhostTrain();
      var data = {};

      gt.get('/', function (req, res) {
        res.send(400);
      });

      gt.get('/users/:id', function (req, res) {
        res.send(200, data);
      });

      gt.get('/users', function (req, res) {
        res.send(400);
      });

      gt.request('GET', '/users/12345', function (err, res, body) {
        expect(err).to.not.be.ok;
        expect(body).to.be.equal(data);
        done();
      });
    });

    [301, 404, 500].forEach(function (status) {
      it('fails request when responding with status code ' + status, function (done) {
        var gt = new GhostTrain();

        gt.get('/users/:id', function (req, res) {
          res.send(status);
        });

        gt.request('GET', '/users/12345', function (err, res, body) {
          expect(err).to.be.ok;
          expect(body).to.not.be.ok;
          done();
        });
      });
    });

    it('makes the request on next tick', function (done) {
      var gt = new GhostTrain();

      var flag = false;

      gt.get('/users', function (req, res) {
        res.send('response');
        expect(flag).to.be.equal(true);
      });

      gt.request('get', '/users', function (err, res, data) {
        done();
      });

      flag = true;
    });
  });
});
