describe('Routing', function () {
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
});
