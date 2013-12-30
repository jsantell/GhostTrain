describe('Mocker.Request', function () {
  describe('Backbone Model', function () {

    it('POST Route', function (done) {
      var mocker = new Mocker();
      var User = createModels(mocker).User;
      var user = new User({
        name: 'Ragnarr Loðbrók',
        job: 'Viking'
      });

      var response = {};

      mocker.post('/users', function (req, res) {
        res.send(response);
      });

      user.save(null, {
        success: function (_, res) {
          expect(res).to.be.equal(response);
          done();
        }
      });
    });

    it('GET Route', function (done) {
      var mocker = new Mocker();
      var User = createModels(mocker).User;
      var user = new User({
        id: 12345
      });

      var response = {};

      mocker.get('/users/:id', function (req, res) {
        res.send(200, {
          name: 'Jesper Strömblad',
          job: 'shredding allday'
        });
      });

      user.fetch({
        success: function (_, res) {
          expect(res.name).to.be.equal('Jesper Strömblad');
          expect(res.job).to.be.equal('shredding allday');
          expect(user.get('name')).to.be.equal('Jesper Strömblad');
          expect(user.get('job')).to.be.equal('shredding allday');
          done();
        }
      });
    });

    it('PUT Route', function (done) {
      var mocker = new Mocker();
      var User = createModels(mocker).User;
      var user = new User({
        name: 'Dominic Cifarelli',
        // Give it an id so Backbone thinks it's an update
        id: 12345
      });

      var response = {};

      mocker.put('/users/:id', function (req, res) {
        res.send(response);
      });

      user.save(null, {
        success: function (_, res) {
          expect(res).to.be.equal(response);
          done();
        }
      });
    });

    it('DELETE Route', function (done) {
      var mocker = new Mocker();
      var User = createModels(mocker).User;
      var user = new User({
        name: 'Dominic Cifarelli',
        // Give it an id so Backbone thinks it's an update
        id: 12345
      });

      var response = {};

      mocker.delete('/users/:id', function (req, res) {
        res.send(response);
      });

      user.destroy({
        success: function (_, res) {
          expect(res).to.be.equal(response);
          done();
        }
      });
    });

  });

  describe('Routing', function () {
    it('uses best matching route', function (done) {
      var mocker = new Mocker();
      var User = createModels(mocker).User;
      var user = new User({
        id: 12345
      });
      
      var data = {
        name: 'Jesper Strömblad',
        job: 'shredding allday'
      };

      mocker.get('/', function (req, res) {
        res.send(400);
      });

      mocker.get('/users', function (req, res) {
        res.send(400);
      });

      mocker.get('/users/:id', function (req, res) {
        res.send(200, data);
      });

      user.fetch({
        success: function (_, res) {
          expect(res).to.be.equal(data);
          done();
        },
        error: done
      });
    });

    [301, 404, 500].forEach(function (status) {
      it('fails request when responding with status code ' + status, function (done) {
        var mocker = new Mocker();
        var User = createModels(mocker).User;
        var user = new User({
          id: 12345
        });
     
        mocker.get('/users/:id', function (req, res) {
          res.send(status);
        });
     
        user.fetch({
          success: done,
          error: function (_, err) {
            expect(err).to.be.ok;
            done();
          }
        });
      });
    });
  });
});
