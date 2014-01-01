var ghost = new GhostTrain();

// Initialize a route:
ghost.get('/', function (req, res) {
  console.log('Responding...');
  res.send(200, "Hello World");
});

// Make a request:
console.log('Requesting...');
ghost.send('GET', '/', function (err, res, body) {
  console.log('Response:');
  console.log(res);
  console.log(body);
});
