require('./setup');
var GhostTrain = require('..');
var STATUS_CODES = require('../lib/utils').STATUS_CODES;
var expect = require('expect.js');
var run = require('./utils').run;

describe('Response', function () {
  describe('properties', function () {
    it('res.headers, when empty, is an empty object', function (done) {
      run(function (req, res) {
        expect(res.headers).to.be.an('object');
        expect(Object.keys(res.headers)).to.have.length(0);
        done();
      });
    });
    it('res.headers contains key/value pairs of header values', function (done) {
      run(function (req, res) {
        expect(res.headers).to.be.an('object');
        expect(Object.keys(res.headers)).to.have.length(0);
        res.set('X-My-Header', 'value');
        expect(res.headers['X-My-Header']).to.be.equal('value');
        done();
      });
    });

    it('res.statusCode defaults to 200', function (done) {
      run(function (req, res) {
        expect(res.statusCode).to.be.equal(200);
        done();
      });
    });

    it('res.statusCode changes when status is set', function (done) {
      run(function (req, res) {
        expect(res.statusCode).to.be.equal(200);
        res.status(400);
        expect(res.statusCode).to.be.equal(400);
        done();
      });
    });
  });

  describe('res.header(), res.set()', function () {
    ['header', 'set'].forEach(function (method) {
      it('res.' + method + '() sets a header value to field', function (done) {
        run(function (req, res) {
          res[method]('X-My-Header', 'some value here');
          res.send();
        }, function (err, res, body) {
          expect(res.headers['X-My-Header']).to.be.equal('some value here');
          done();
        });
      });
    });
  });

  describe('res.get()', function () {
    it('retrieves a header value', function (done) {
      run(function (req, res) {
        res.set('X-My-Header', 'some value');
        expect(res.get('X-My-Header')).to.be.equal('some value');
        res.contentType('application/json');
        expect(res.get('Content-Type')).to.be.equal('application/json');
        res.send({});
      }, function (err, res, body) {
        done();
      });
    });
  });

  describe('res.contentType(), res.type()', function () {
    ['contentType', 'type'].forEach(function (method) {
      it('sets the Content-Type header when using res.'+method+'()', function (done) {
        run(function (req, res) {
          res[method]('application/json');
          res.send('{"name":"jetpacks"}');
        }, function (err, res, body) {
          expect(res.headers['Content-Type']).to.be.equal('application/json');
          expect(body).to.be.an('object');
          expect(body.name).to.be.equal('jetpacks');
          done();
        });
      })
    });
  });

  describe('res.status()', function () {
    ['hello', {}, true, null].forEach(function (obj) {
      var type = obj === null ? 'null' : typeof obj;
      it('overrides the default status when sending: ' + type, function (done) {
        run(function (req, res) {
          res.status(201);
          res.send(obj);
        }, function (err, res, body) {
          expect(res.statusCode).to.be.equal(201);
          done();
        });
      });
    });
  });

  describe('res.json()', function () {
    it('res.json(null) sends empty object as application/json', function (done) {
      run(function (req, res) {
        res.json(null);
      }, function (err, res, body) {
        expect(res.statusCode).to.be.equal(200);
        expect(res.headers['Content-Type']).to.be.equal('application/json');
        expect(body).to.be.an('object');
        expect(Object.keys(body)).to.have.length(0);
        done();
      });
    });

    it('res.json(OBJECT) sends object as application/json with status 200', function (done) {
      var response = { name: 'charlie' };
      run(function (req, res) {
        res.json(response);
      }, function (err, res, body) {
        expect(res.statusCode).to.be.equal(200);
        expect(res.headers['Content-Type']).to.be.equal('application/json');
        expect(body).to.be.an('object');
        expect(Object.keys(body)).to.have.length(1);
        expect(body.name).to.be.equal('charlie');
        expect(body).to.not.be.equal(response);
        done();
      });
    });

    it('res.json(NUMBER, OBJECT) sends object as application/json with status NUMBER', function (done) {
      var response = { name: 'charlie' };
      run(function (req, res) {
        res.json(401, response);
      }, function (err, res, body) {
        expect(res.statusCode).to.be.equal(401);
        expect(res.headers['Content-Type']).to.be.equal('application/json');
        expect(body).to.be.an('object');
        expect(Object.keys(body)).to.have.length(1);
        expect(body.name).to.be.equal('charlie');
        expect(body).to.not.be.equal(response);
        done();
      });
    });
  });

  describe('res.jsonp()', function () {

  });

  describe('res.send()', function () {
    it('res.send(NUMBER, STRING) as "text/html" with status NUMBER', function (done) {
      run(function (req, res) {
        res.send(500, 'Some error occurred.');
      }, function (err, res, body) {
        expect(err).to.not.be.ok();
        expect(res.statusCode).to.be.equal(500);
        expect(res.headers['Content-Type']).to.be.equal('text/html');
        expect(body).to.be.equal('Some error occurred.');
        done();
      });
    });

    it('res.send(STRING) as "text/html" and defaults to 200', function (done) {
      run(function (req, res) {
        res.send('hello there');
      }, function (err, res, body) {
        expect(err).to.not.be.ok();
        expect(res.statusCode).to.be.equal(200);
        expect(res.headers['Content-Type']).to.be.equal('text/html');
        expect(body).to.be.equal('hello there');
        done();
      });
    });

    it('res.send(NUMBER, OBJECT) as "application/json" with status NUMBER', function (done) {
      run(function (req, res) {
        res.send(400, { name: 'boba fett' });
      }, function (err, res, body) {
        expect(err).to.not.be.ok();
        expect(res.statusCode).to.be.equal(400);
        expect(res.headers['Content-Type']).to.be.equal('application/json');
        expect(body.name).to.be.equal('boba fett');
        done();
      });
    });

    it('res.send(OBJECT) as "application/json" and defaults to 200', function (done) {
      run(function (req, res) {
        res.send({ name: 'boba fett' });
      }, function (err, res, body) {
        expect(err).to.not.be.ok();
        expect(res.statusCode).to.be.equal(200);
        expect(res.headers['Content-Type']).to.be.equal('application/json');
        expect(body.name).to.be.equal('boba fett');
        done();
      });
    });

    it('res.send(ARRAY) as "application/json" and defaults to 200', function (done) {
      var response = ['a', 'b', 'c'];
      run(function (req, res) {
        res.send(response);
      }, function (err, res, body) {
        expect(err).to.not.be.ok();
        expect(res.statusCode).to.be.equal(200);
        expect(res.headers['Content-Type']).to.be.equal('application/json');
        expect(body[0]).to.be.equal('a');
        expect(body[1]).to.be.equal('b');
        expect(body[2]).to.be.equal('c');
        expect(body).to.have.length(3);
        done();
      });
    });

    it('sending JS Object clones the object, and are equiv, not equal', function (done) {
      var response = { name: 'boba fett' };
      run(function (req, res) {
        res.send(response);
      }, function (err, res, body) {
        expect(body).to.not.be.equal(response);
        expect(err).to.not.be.ok();
        expect(res.statusCode).to.be.equal(200);
        expect(res.headers['Content-Type']).to.be.equal('application/json');
        expect(body.name).to.be.equal('boba fett');
        done();
      });
    });

    it('sending array clones the object, and are equiv, not equal', function (done) {
      var response = ['a', 'b', 'c'];
      run(function (req, res) {
        res.send(response);
      }, function (err, res, body) {
        expect(err).to.not.be.ok();
        expect(res.statusCode).to.be.equal(200);
        expect(res.headers['Content-Type']).to.be.equal('application/json');
        expect(body[0]).to.be.equal('a');
        expect(body[1]).to.be.equal('b');
        expect(body[2]).to.be.equal('c');
        expect(body).to.have.length(3);
        done();
      });
    });

    [200, 204, 300, 301, 302, 400, 500, 504].forEach(function (statusCode) {
      it('res.send('+statusCode+') sends default HTTP response as "text/plain"', function (done) {
        run(function (req, res) {
          res.send(statusCode);
        }, function (err, res, body) {
          expect(err).to.not.be.ok();
          expect(res.statusCode).to.be.equal(statusCode);
          expect(res.headers['Content-Type']).to.be.equal('text/plain');
          expect(body).to.be.equal(STATUS_CODES[statusCode]);
          done();
        });
      });
    });
  });
});
