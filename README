# Mocker

Create mock routes for client-side frameworks with Express-like API

## Usage

Set up a `mocker` instance

```javascript
var mocker = new Mocker();
```

Set up routes

```javascript
var users = {
  '1': {
    name: 'Ozzie Isaacs',
    skills: ['Planet Riding']
  }
}

mocker.get('/users/:id', function (req, res) {
  res.send(200, users[req.parms.id]);
});
```

Tie `mocker` into your Backbone model

```javascript
// Backbone.js
var User = Backbone.Model.extend({
  urlRoot: '/users',
  sync: mocker.sync()
});
```

In action:

```javascript
var user = new User({ id: 1 });
user.fetch({
  success: function () {
    user.get('name'); // 'Ozzie Isaacs'
    user.get('skills'); // ['Planet Riding']
  });
});
```

## API

### mocker

#### mocker.set(name, value)

Sets a setting value, similar to Express's [app.set](http://expressjs.com/api.html#app.set). The [application settings](http://expressjs.com/api.html#app-settings) currently supported are:

* `case sensitive routing`
* `strict routing`
* `json replacer`
* `json spaces`

#### mocker.get(name)

Gets a setting value, similar to Express's [app.get](http://expressjs.com/api.html#app.get).

#### mocker.enable(name)

Sets a setting value to `true`, similar to Express's [app.enable](http://expressjs.com/api.html#app.enable)

#### mocker.disable(name)

Sets a setting value to `false`, similar to Express's [app.disable](http://expressjs.com/api.html#app.disable)

#### mocker.VERB(route, callback)

Creates a route; VERB can be `get`, `post`, `put`, or `delete`, similar to Express's [app.verb](http://expressjs.com/api.html#app.VERB).

#### mocker.sync()

Returns a replacement function for `Backbone.sync` to be used in Backbone.models.

### request

The `request` object is passed into the route callback as the first argument. Much of the API attempts to mimic Express's [request](http://expressjs.com/api.html#request).

#### req.params

Contains an array of mapped route "parameters", like Express's [req.params](http://expressjs.com/api.html#req.params).

#### req.body

Is an object containing the parsed request body, like Express's [req.body](http://expressjs.com/api.html#req.body).

### response

#### res.send([body|status],[body])

Send a response; has the same API as Express's [res.send](http://expressjs.com/api.html#res.send).

#### res.json([status|body][body])

Send a JSON response; same API as Express's [res.json](http://expressjs.com/api.html#res.json).

#### res.status(code)

Sets the response status code to `code`, similar to Express's [res.status](http://expressjs.com/api.html#res.status).
