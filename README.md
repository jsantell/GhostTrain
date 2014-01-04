# GhostTrain

[![browser support](https://ci.testling.com/jsantell/GhostTrain.png)](https://ci.testling.com/jsantell/GhostTrain)

[![Build Status](https://travis-ci.org/jsantell/GhostTrain.png)](https://travis-ci.org/jsantell/GhostTrain)

Mock router library for serving mock data statically. [http://ghosttrainjs.com](http://ghosttrainjs.com)

## About

GhostTrain is a mock router library for serving mock data statically. Leveraging the same API as [Express](http://expressjs.com), GhostTrain allows developers to send mock requests to GhostTrain rather than making HTTP requests to a server, for development, testing and demos. Run in a browser, in node, and take development to the next level.


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

Documentation can be found at [ghosttrainjs.com](http://ghosttrainjs.com).


## Browser Support

**GhostTrain** has been tested on latest versions of Firefox, Chrome, Safari, Opera, and IE8+. For IE8 support, several polyfills and APIs must be implemented; you can use the `./dist/ghosttrain-legacy.js` build which contains all these polyfills, or implement them on your own. The methods needed are:

* `Array.prototype.indexOf`
* `Array.prototype.map`
* `Array.prototype.forEach`
* `Array.isArray`
* `String.prototype.trim`
* `Object.keys`
* `JSON.parse`
* `JSON.stringify`

In a Browserify environment you can also pull in the legacy support files via `require('ghosttrain/legacy')`.

## License

MIT License
