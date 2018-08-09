// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var dns = require('dns');
// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function(request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log('Your app is listening on port ' + listener.address().port);
});

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });

var bodyParser = require('body-parser');
app.use('/api/shorturl/new', bodyParser.urlencoded({ extended: false }));


/** # SCHEMAS and MODELS #
/*  ====================== */

var Schema = mongoose.Schema;
 
var urlSchema  = new Schema({
  url: String,
  short: Number
});

var Url = mongoose.model('Url', urlSchema);

app.route('/api/shorturl/new').post(function(req,res){
  dns.lookup(req.body.input_url, (err, address, family) => {
    if (err) {
      res.json({"error":"invalid URL"});}

      Url.findOne({}, { sort: { '_id': -1 } }, function(err, data) {
        if (data) {
        new Url({
            url: req.body.input_url,
            short: data.short + 1
        }).save();
          res.json({url: req.body.input_url, short: data.short +1});
          } else {
            new Url({
            url: req.body.input_url,
            short: 1
        }).save();
        res.json({url: req.body.input_url, short: 1});
}
        
      });

  
  });
});

app.use('/api/shorturl/:num', bodyParser.urlencoded({ extended: false }));
app.route('/api/shorturl/:num').get(function(req,res){
  var query = Url.findOne({short: req.params.num});
  query.exec((err, data)=>{
  if (err) return err;
  return res.redirect('http://' + data.url);
 });
});

module.exports = app;