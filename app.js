var express = require('express');
var cors = require('cors');
var path = require('path');
var app = express();
app.use(cors());

var bodyParser = require('body-parser')
var _ = require('underscore');
var itemService = require('./itemService');
var rankingService = require('./rankingService');
var userService = require('./userService');

// create application/json parser
var jsonParser = bodyParser.json();

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.get('/index.html', function(req, res){
  res.sendFile('index.html',{ root: path.join(__dirname, 'public') });
});

app.get('/', function(req, res){
  res.sendFile('index.html',{ root: path.join(__dirname, 'public') });
});

app.post('/items', jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);

  console.log(req.body);

  res.status(201).send(itemService.add(req.body));
});

app.get('/items/:id', function(req, res) {
  var item = itemService.get(req.params.id);

  item ? res.status(200).send(item) : res.sendStatus(404);
});

app.get('/items', function(req, res) {
  res.status(200).send(itemService.getAll());
});

app.post('/items/:id/priority', jsonParser, function(req, res) {
  if (!req.body) return res.sendStatus(400);

  console.log(req.body);

  var vote = itemService.vote(req.params.id, req.body);

  if (vote) {
    rankingService.invalidate();
  }

  res.status(201).send();
});

app.get('/rankedItems', function(req, res) {
  var items = itemService.getAll();
  res.status(200).send(rankingService.getRankedItems(items));
});

app.get('/ranks', function(req,res){
  var userRanks = userService.getAll();
  var ranked = rankingService.getRankedItems(userRanks);
  var rankedOut = ranked.map(function(aRank){
    return {
      "id" : aRank.id,
      "title" : aRank.title
    }
  })
  res.status(200).send(rankedOut);
});

app.get('/ranks/user/:userId', function(req,res){
  return res.send(userService.get(req.params.userId) || {});
});

app.post('/ranks/user/:userId', jsonParser, function(req, res){
  if (!req.body) return res.sendStatus(400);

  console.log(req.body);

  var ret = userService.set(req.params.userId, req.body);

  if (ret) return res.sendStatus(200);
  else return res.sendStatus(400);
});

app.listen(3000, '0.0.0.0');
console.log('Express server started on port %s', 3000);
