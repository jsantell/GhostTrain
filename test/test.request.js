describe('Request', function () {
  describe('req.params', function () {
    it('populates req.params array from :params in route', function (done) {
      var gt = new GhostTrain();

      gt.get('/users/:field1/:field2/:id', function (req, res) {
        expect(req.params.field1).to.be.equal('long');
        expect(req.params.field2).to.be.equal('user');
        expect(req.params.id).to.be.equal('12345');
        res.send();
      });

      gt.send('GET', '/users/long/user/12345', function (err, res) {
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

      gt.send('GET', '/users/long/user/12345', function (err, res) {
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

      gt.send('POST', '/users', {
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

      gt.send('GET', '/users/12345', function (err, res) {
        done();
      });
    });
  });
});
