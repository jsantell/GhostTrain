# GhostTrain

[![browser support](https://ci.testling.com/jsantell/GhostTrain.png)](https://ci.testling.com/jsantell/GhostTrain)

[![Build Status](https://travis-ci.org/jsantell/GhostTrain.png)](https://travis-ci.org/jsantell/GhostTrain)

Client-side router in the spirit of [Express](http://expressjs.com) for mock data, development and demos.

## Usage

Set up a `ghosttrain` instance

```javascript
var ghosttrain = new GhostTrain();
```

Set up routes

```javascript
var users = {
  '1': {
    name: 'Ozzie Isaacs',
    skills: ['Planet Riding']
  }
}

ghosttrain.get('/users/:id', function (req, res) {
  res.request(200, users[req.parms.id]);
});
```

```javascript
ghosttrain.request('GET', '/users/12345', function (err, res, body) {
  console.log(body);
  // { name: 'Ozzie Isaacs', skills: ['Planet Riding'] }
  console.log(res.statusCode);
  // 200
});
```

## API

### GhostTrain()

#### ghosttrain.request(method, path, [options], callback)

Makes a request to the `GhostTrain` instance's router. Takes an HTTP `method`, `path`, optional `options` object, and a `callback` accepting an `err`, `res` and `body` in its arguments.

Possible options are:

* `delay`- Number of ms to wait before executing routing (default: `1`)
* `body`- Object representing POST body data (default: `{}`)
* `headers`- Object of pairings of header values (default: `{}`)
* `contentType`- Sets headers for `Content-Type`


#### ghosttrain.set(name, value)

Sets a setting value, similar to Express's [app.set](http://expressjs.com/api.html#app.set). The [application settings](http://expressjs.com/api.html#app-settings) currently supported are:

* `case sensitive routing`
* `strict routing`
* `json replacer`
* `json spaces`

#### ghosttrain.get(name)

Gets a setting value, similar to Express's [app.get](http://expressjs.com/api.html#app.get).

#### ghosttrain.enable(name)

Sets a setting value to `true`, similar to Express's [app.enable](http://expressjs.com/api.html#app.enable)

#### ghosttrain.disable(name)

Sets a setting value to `false`, similar to Express's [app.disable](http://expressjs.com/api.html#app.disable)

#### ghosttrain.VERB(route, callback)

Creates a route; VERB can be `get`, `post`, `put`, or `delete`, similar to Express's [app.verb](http://expressjs.com/api.html#app.VERB).

### Request

The `request` object is passed into the route callback as the first argument. Much of the API attempts to mimic Express's [request](http://expressjs.com/api.html#request).

#### req.params

Contains an array of mapped route "parameters", like Express's [req.params](http://expressjs.com/api.html#req.params).

#### req.body

Is an object containing the parsed request body, like Express's [req.body](http://expressjs.com/api.html#req.body).

### Response

#### res.send([body|status],[body])

Send a response; has the same API as Express's [res.send](http://expressjs.com/api.html#res.send).

#### res.json([status|body][body])

Send a JSON response; same API as Express's [res.json](http://expressjs.com/api.html#res.json).

#### res.status(code)

Sets the response status code to `code`, similar to Express's [res.status](http://expressjs.com/api.html#res.status).
