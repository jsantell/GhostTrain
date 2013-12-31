var GhostTrain = require('..');
var expect = require('chai').expect;

describe('Routing', function () {
  describe('GhostTrain#VERB', function () {
    it('GhostTrain#post(path, callback)', function (done) {
      var gt = new GhostTrain();

      gt.post('/users', function (req, res) {
        res.send('response');
      });

      gt.send('POST', '/users', function (err, res, data) {
        expect(err).to.be.not.ok;
        expect(data).to.be.equal('response');
        done();
      });
    });

    it('GhostTrain#get(path, callback)', function (done) {
      var gt = new GhostTrain();

      gt.get('/users', function (req, res) {
        res.send('response');
      });

      gt.send('GET', '/users', function (err, res, data) {
        expect(err).to.be.not.ok;
        expect(data).to.be.equal('response');
        done();
      });
    });

    it('GhostTrain#put(path, callback)', function (done) {
      var gt = new GhostTrain();

      gt.put('/users', function (req, res) {
        res.send('response');
      });

      gt.send('PUT', '/users', function (err, res, data) {
        expect(err).to.be.not.ok;
        expect(data).to.be.equal('response');
        done();
      });
    });

    it('GhostTrain#delete(path, callback)', function (done) {
      var gt = new GhostTrain();

      gt['delete']('/users', function (req, res) {
        res.send('response');
      });

      gt.send('DELETE', '/users', function (err, res, data) {
        expect(err).to.be.not.ok;
        expect(data).to.be.equal('response');
        done();
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

      gt.send('GET', '/users/12345', function (err, res, body) {
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

        gt.send('GET', '/users/12345', function (err, res, body) {
          expect(err).to.be.ok;
          expect(body).to.not.be.ok;
          done();
        });
      });
    });
  });
});
