require('./setup');
var GhostTrain = require('..');
var expect = require('expect.js');

describe('GhostTrain methods', function () {
  describe('settings', function () {
    it('GhostTrain#enable sets value to true', function () {
      var gt = new GhostTrain();
      gt.enable('my variable');
      expect(gt.get('my variable')).to.be.equal(true);
    });
    
    it('GhostTrain#disable sets value to false', function () {
      var gt = new GhostTrain();
      gt.set('my variable', 'hello');
      gt.disable('my variable');
      expect(gt.get('my variable')).to.be.equal(false);
    });
    
    it('GhostTrain#set sets value', function () {
      var gt = new GhostTrain();
      gt.set('my variable', 'hello');
      expect(gt.get('my variable')).to.be.equal('hello');
    });
    
    it('GhostTrain#get sets value', function () {
      var gt = new GhostTrain();
      expect(gt.get('delay')).to.be.equal(0);
    });
  });
});
