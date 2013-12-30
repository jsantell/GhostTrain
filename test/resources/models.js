function createModels (mocker) {
  var User = Backbone.Model.extend({
    urlRoot: '/users',
    sync: mocker.sync()
  });

  var Users = Backbone.Collection.extend({
    url: '/users',
    sync: mocker.sync(),
    model: User
  });

  return {
    User: User,
    Users: Users
  };
}
