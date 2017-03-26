var express = require('express');
var validUrl = require('valid-url');
var shortid = require('shortid');
var mongodb = require('mongodb');
//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

var dotenv = require('dotenv');
dotenv.load();

var app = express();

var url = process.env.MONGOLAB_URI;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/new/:url(*)', function(req, res){
   var inputURL = req.params.url;
   console.log(inputURL);
    if (validUrl.isUri(inputURL)){
        console.log('Looks like an URI');
        //Connect to db
        MongoClient.connect(url, function (err, db) {
            if (err) {
                res.send('Unable to connect to the mongoDB server. Error:', err);
                console.log('Unable to connect to the mongoDB server. Error:', err);
            } else {
                console.log('Connection established to', url);
                // do some work here with the database.
                var urlShortner = db.collection('short-url');
                var shortId = shortid.generate();
                urlShortner.insert([{url:inputURL, shortId:shortId}], function(){
                    res.json({
                       original_url:inputURL,
                       short_url:'http://'+req.headers['host']+'/'+shortId
                    });
                    console.log(inputURL);
                    console.log('http://'+req.headers['host']+'/'+shortId);
                });
                //Close connection
                db.close();
            }
        });
    } else {
        console.log('Not a Valid URI.');
        res.send('Not a Valid URI. Kindly enter like "http://www.example.com" or "https://www.example.com"');
    }
});

app.get('/:shortId', function(req, res){
   var shortId = req.params.shortId;
   console.log('shortId : '+shortId);
   //Connect to db
    MongoClient.connect(url, function (err, db) {
        if (err) {
                console.log('Unable to connect to the mongoDB server. Error:', err);
        } else {
            console.log('Connection established to', url);
            // do some work here with the database.
            var urlShortner = db.collection('short-url');
            urlShortner.find({shortId:shortId}).toArray(function(err, docs){
               if(err){
                   res.send("Could not find id");
               } else{
                   res.redirect(docs[0].url);
                   db.close();
               }
            });
        }
    });    
});

app.listen(process.env.PORT || 8080, function(){
    console.log("file meta data app listening to 8080 || process.env.PORT");
});