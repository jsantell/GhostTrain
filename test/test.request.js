require('./setup');
var GhostTrain = require('..');
var expect = require('chai').expect;
var getSupported = require('../lib/get').isSupported;

describe('Request', function () {
  describe('properties', function () {

    describe('req.headers', function () {
      it('exposes set headers', function (done) {
        var gt = new GhostTrain();

        gt.get('/', function (req, res) {
          expect(req.headers['Content-Type']).to.be.equal('application/json');
          expect(req.headers['User-Agent']).to.be.equal('hovercraft;v30.0.23;like-gecko');
          done();
        });

        gt.request('GET', '/', {
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'hovercraft;v30.0.23;like-gecko'
          }
        }, function () {});

      });

      it('defaults to {}', function (done) {
        testProps('GET', '/', function (req, res) {
          expect(req.headers).to.be.an('object');
          expect(Object.keys(req.headers)).to.have.length(0);
          done();
        });
      });
    });

    describe('req.xhr', function () {
      it('returns `true` when `X-Requested-With` is set to `XMLHttpRequest`', function (done) {
        var gt = new GhostTrain();
        gt.get('/', function (req, res) {
          expect(req.xhr).to.be.equal(true);
          done();
        });

        gt.request('GET', '/', { headers: {'X-Requested-With': 'xmlhttprequest'}}, function () {});
      });
      it('returns `false` when `X-Requested-With` is unset', function (done) {
        var gt = new GhostTrain();
        gt.get('/', function (req, res) {
          expect(req.xhr).to.be.equal(false);
          done();
        });

        gt.request('GET', '/');
      });
    });

    describe('req.route', function () {
      it('contains the matching route', function (done) {
        testProps('GET', '/dinosaurtown', function (req, res) {
          expect(req.route.path).to.be.equal('/dinosaurtown');
          expect(req.route.method).to.be.equal('get');
          done();
        });
      });
    });

    describe('req.method', function () {
      ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'PATCH'].forEach(function (verb) {
        it('returns correct method for ' + verb, function (done) {
          testProps(verb, '/', function (req, res) {
            expect(req.method).to.be.equal(verb);
            done();
          });
        });
      });
    });

    describe('req.url, req.originalUrl', function () {
      it('returns URL for absolute URL', function (done) {
        var url = 'http://inflames.com/shredding/oh/yuh';
        testProps('get', url, function (req, res) {
          expect(req.url).to.be.equal(url);
          expect(req.originalUrl).to.be.equal(url);
          done();
        });
      });

      it('returns URL for relative URL', function (done) {
        var url = '/path/to/rocks';
        testProps('get', url, function (req, res) {
          expect(req.url).to.be.equal(url);
          expect(req.originalUrl).to.be.equal(url);
          done();
        });
      });
    });

    describe('req.path', function () {
      it('has correct path for absolute url', function (done) {
        testProps('GET', 'http://mozilla.org/nightly/browser', function (req, res) {
          expect(req.path).to.be.equal('/nightly/browser');
          done();
        });
      });

      it('has correct path for relative url', function (done) {
        testProps('GET', '/nightly/browser', function (req, res) {
          expect(req.path).to.be.equal('/nightly/browser');
          done();
        });
      });
    });

    describe('req.protocol', function () {
      it('returns correct protocol for http', function (done) {
        testProps('GET', 'http://mozilla.org/path/firefox', function (req, res) {
          expect(req.protocol).to.be.equal('http');
          done();
        });
      });
      it('returns correct protocol for ftp', function (done) {
        testProps('GET', 'ftp://mozilla.org/path/firefox', function (req, res) {
          expect(req.protocol).to.be.equal('ftp');
          done();
        });
      });
      it('returns correct protocol for https', function (done) {
        testProps('GET', 'https://mozilla.org/path/firefox', function (req, res) {
          expect(req.protocol).to.be.equal('https');
          done();
        });
      });
      it('returns local page\'s protocol for relative links', function (done) {
        testProps('GET', '/path/to/yeah', function (req, res) {
          var protocol = 'window' in this ? window.location.protocol : '';
          expect(req.protocol).to.be.equal(protocol.replace(':',''));
          done();
        });
      });
    });

    describe('req.secure', function () {
      it('secure is true for https', function (done) {
        testProps('GET', 'https://mozilla.org/path/firefox', function (req, res) {
          expect(req.secure).to.be.equal(true);
          done();
        });
      });
      it('returns false for non-https', function (done) {
        var count = 3;
        testProps('GET', 'http://mozilla.org/path/firefox', function (req, res) {
          expect(req.secure).to.be.equal(false);
          complete();
        });
        testProps('GET', 'http://mozilla.org/path/firefox', function (req, res) {
          expect(req.secure).to.be.equal(false);
          complete();
        });
        testProps('GET', 'http://mozilla.org/path/firefox', function (req, res) {
          expect(req.secure).to.be.equal(false);
          complete();
        });

        function complete () { if (!--count) done() }
      });
    });
    describe('req.params', function () {
      it('populates req.params array from :params in route', function (done) {
        var gt = new GhostTrain();

        gt.get('/users/:field1/:field2/:id', function (req, res) {
          expect(req.params.field1).to.be.equal('long');
          expect(req.params.field2).to.be.equal('user');
          expect(req.params.id).to.be.equal('12345');
          res.send();
        });

        gt.request('GET', '/users/long/user/12345', function (err, res) {
          done();
        });
      });

      it('populates req.params array from regex in route', function (done) {
        var gt = new GhostTrain();

        gt.get(/users\/([^\/]*)\/u(ser)\/([^\/]*)/, function (req, res) {
          expect(req.params[0]).to.be.equal('long');
          expect(req.params[1]).to.be.equal('ser');
          expect(req.params[2]).to.be.equal('12345');
          res.send();
        });

        gt.request('GET', '/users/long/user/12345', function (err, res) {
          done();
        });
      });
    });

    describe('req.query', function () {
      it('returns query object', function (done) {
        var gt = new GhostTrain();

        gt.get('/users', function (req, res) {
          expect(req.query.name).to.be.equal('justin%20timberlake');
          expect(req.query.password).to.be.equal('smoothpop');
          expect(Object.keys(req.query)).to.have.length(2);
          res.send();
        });

        gt.request('GET', '/users?name=justin%20timberlake&password=smoothpop', function (err, res, body) {
          done();
        });
      });

      it('defaults to an empty {}', function (done) {
        var gt = new GhostTrain();

        gt.get('/users', function (req, res) {
          expect(req.query).to.be.an('object');
          expect(Object.keys(req.query)).to.have.length(0);
          res.send();
        });

        gt.request('GET', '/users', function (err, res, body) {
          done();
        });
      });
    });

    describe('req.body', function () {
      it('populates req.body on POST', function (done) {
        var gt = new GhostTrain();

        gt.post('/users', function (req, res) {
          expect(req.body.name).to.be.equal('Justin Timberlake');
          expect(req.body.jams).to.be.equal('FutureSex/LoveSounds');
          res.send();
        });

        gt.request('POST', '/users', {
          body: {
            name: 'Justin Timberlake',
            jams: 'FutureSex/LoveSounds'
          }
        }, function (err, res) {
          done();
        });
      });

      it('it is an empty object by default', function (done) {
        var gt = new GhostTrain();

        gt.get('/users/:id', function (req, res) {
          expect(req.body).to.be.an('object');
          res.send();
        });

        gt.request('GET', '/users/12345', function (err, res) {
          done();
        });
      });
    });
  });

  describe('req.param()', function () {
    it('returns params, falls back to body, then query', function (done) {
      var gt = new GhostTrain();

      gt.post('/users/:id/show/', function (req, res) {
        expect(req.param('id')).to.be.equal('12345');
        expect(req.param('name')).to.be.equal('dudedude');
        expect(req.param('q')).to.be.equal('myquery');
        res.send();
      });

      gt.request('POST', '/users/12345/show?q=myquery&id=123', {
        body: { 'id': 789, 'name': 'dudedude' }
      }, function (err, res, body) {
        done();
      });
    });
  });

  describe('req.range()', function () {
    it('returns correct range');
  });

  describe('req.is()', function () {
    it('returns true for matching content types', function (done) {
      var gt = new GhostTrain();

      gt.get('/', function (req, res) {
        expect(req.is('json')).to.be.equal(true);
        expect(req.is('application/json')).to.be.equal(true);
        expect(req.is('application/*')).to.be.equal(true);
        expect(req.is('html')).to.be.equal(false);
        expect(req.is('text/html')).to.be.equal(false);
        expect(req.is('text/*')).to.be.equal(false);
        res.send();
      });

      gt.request('GET', '/', {
        headers: {
          'Content-Type': 'application/json'
        }
      }, function () {
        done();
      });
    });

    it('returns false for not matching content types', function (done) {
      var gt = new GhostTrain();

      gt.get('/', function (req, res) {
        expect(req.is('html')).to.be.equal(false);
        expect(req.is('text/html')).to.be.equal(false);
        expect(req.is('text/*')).to.be.equal(false);
        expect(req.is('')).to.be.equal(false);
        res.send();
      });

      gt.request('GET', '/', {
        headers: {
          'Content-Type': 'application/json'
        }
      }, function () {
        done();
      });
    });
  });

  describe('req.get(), req.header()', function () {
    ['get', 'header'].forEach(function (method) {
      it('returns correct header for name for req.' + method + '()', function (done) {
        var gt = new GhostTrain();

        gt.get('/', function (req, res) {
          expect(req[method]('Content-Type')).to.be.equal('text/html');
          done();
        });
        gt.request('GET', '/', { headers: { 'Content-Type': 'text/html' }}, function () {});
      });

      it('returns undefined for unset headers for req.' + method + '()', function (done) {
        var gt = new GhostTrain();

        gt.get('/', function (req, res) {
          expect(req[method]('X-Some-Header')).to.be.equal(undefined);
          done();
        });
        gt.request('GET', '/', { headers: { 'Content-Type': 'text/html' }}, function () {});
      });
    });
  });

  describe('Unsupported properties', function () {
    ['subdomains', 'stale', 'fresh', 'ip', 'ips', 'auth',
      'accepted', 'acceptedEncodings', 'acceptedCharsets', 'acceptedLanguages'].forEach(function (prop) {
      if (getSupported()) {
        it('accessing `req.' + prop + '` throws on supported browsers', function (done) {
          testProps('GET', '/', function (req, res) {
            expect(function () {
              req[prop];
            }).to['throw'](Error);
            done();
          });
        });
      } else {
        it('accessing `req.' + prop + '` is undefined because browser does not support `Object.defineProperty`', function (done) {
          testProps('GET', '/', function (req, res) {
            expect(req[prop]).to.be.equal(undefined);
            done();
          });
        });
      }
    });
  });

  describe('Unsupported methods', function () {
    ['accepts', 'acceptsEncoding', 'acceptsCharset', 'acceptsLanguage'].forEach(function (prop) {
      it('Calling `req.' + prop + '()` throws', function (done) {
        testProps('GET', '/', function (req, res) {
          expect(function () {
            req[prop]();
          }).to['throw'](Error);
          done();
        });
      });
    });
  });
});

function testProps (method, url, callback) {
  var gt = new GhostTrain();
  gt[method.toLowerCase()](url, callback);
  gt.request(method, url, function () {});
}
