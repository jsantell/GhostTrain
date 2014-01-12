require('./setup');
var utils = require('../lib/utils');
var expect = require('expect.js');
var parseURL = require('../lib/url').parse;

/**
 * Mostly sanity checks here
 */

describe('Utils', function () {
  describe('utils.STATUS_CODES', function () {
    it('is a large hash of codes to strings', function () {
      expect(utils.STATUS_CODES).to.be.an('object');
      expect(utils.STATUS_CODES[200]).to.be.equal('OK');
      expect(utils.STATUS_CODES[404]).to.be.equal('Not Found');
    });
  });

  describe('utils.clone', function () {
    it('creates a new object with the properties of the previous (shallow)', function () {
      var obj = {
        name: 'Ville Viljanen',
        albums: ['Inhumanity', 'The Unborn', 'Liberation = Termination', '...And Death Said Live']
      };
      var newObj = utils.clone(obj);

      expect(newObj.name).to.be.equal('Ville Viljanen');
      expect(newObj.albums[0]).to.be.equal('Inhumanity');
      expect(newObj.albums).to.be.equal(obj.albums);

      // Test it's a new copy
      obj.name = 'Jarkko Kokko';
      expect(newObj.name).to.be.equal('Ville Viljanen');

      // But objects are shallowly copied
      obj.albums.push('NEW ALBUM');
      expect(newObj.albums.indexOf('NEW ALBUM')).to.be.greaterThan(-1);
    });

    [null, undefined, ['1','2'], 1, 'hello'].forEach(function (arg) {
      var argType = typeof arg;
      argType = argType === 'object' ? (Array.isArray(arg) ? 'Array' : arg ): argType;
      it('returns a new obj if an invalid arg passed in (' + argType + ')', function () {
        var output1 = utils.clone(arg);
        expect(!!output1).to.be.equal(true);
        expect(output1).to.be.an('object');
        expect(Object.keys(output1).length).to.be.equal(0);
        expect(output1).not.to.be.equal(arg);
      });
    });
  });

  describe('utils.pathFromURL', function () {
    ['string', 'parsed'].forEach(function (type) {
      function parse (string) { return type === 'parsed' ? parseURL(string) : string; }

      it('Returns route path from absolute URL string (with port) (' + type +')', function () {
        var result = utils.pathFromURL(parse('http://subdomain.subdomain.domain.net:2434/my-route/something/?q=myquery'));
        expect(result).to.be.equal('/my-route/something/?q=myquery');
      });
    
      it('Returns route path from absolute URL string (localhost) (' + type +')', function () {
        var result = utils.pathFromURL(parse('http://localhost/my-route/something/?q=myquery'));
        expect(result).to.be.equal('/my-route/something/?q=myquery');
      });
    
      it('Returns route path from absolute URL string (localhost and port) (' + type + ')', function () {
        var result = utils.pathFromURL(parse('http://localhost:9999/my-route/something/?q=myquery'));
        expect(result).to.be.equal('/my-route/something/?q=myquery');
      });
    
      it('Returns route path from absolute URL string (no query) (' + type + ')', function () {
        var result = utils.pathFromURL(parse('http://localhost:9999/my-route/something/'));
        expect(result).to.be.equal('/my-route/something/');
      });

      it('Returns route path from relative URL (' + type +')', function () {
        var result = utils.pathFromURL(parse('/my-route/something/?q=myquery'));
        expect(result).to.be.equal('/my-route/something/?q=myquery');
      });
    });
  });
});
