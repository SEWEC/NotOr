const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
var path = require( 'path' );
const bodyParser = require('body-parser'); 
var fs = require('fs');

var pword = "ZQhyTiLkWNwxMNoh";

var connectionString = "mongodb+srv://me:" + pword + "@cluster0.0tcu1.azure.mongodb.net/saves?retryWrites=true&w=majority"

var MongoClient = require('mongodb').MongoClient;

/*
MongoClient.connect(connectionString, {useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  dbo.collection("saves").createIndex({url: "hashed"});
}
*/

  app.use(bodyParser.json({limit: '50mb'}));
  app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));

  app.use( express.static( __dirname + '/Client'));

  app.get('/:save/test', (req, res) => {
    console.log(req.params["save"]);
    MongoClient.connect(connectionString, {useUnifiedTopology: true}, function(err, db) {
      if (err) throw (err);
      db.db("mydb").collection("saves").find({url: parseInt(req.params["save"],10)}).toArray(function(err3, response) {
        if (err3) {
          db.close();
        } else {
          try{res.send(JSON.stringify(response[0].info));} catch{}
          db.close();
        }
      });
    });
  });

  app.get('/*', (req, res) => {
    res.sendFile(path.join( __dirname, 'Client', 'NotOr.html'));
  });

  app.listen(port, () => {
    console.log(`listening at ${port}`);
  });

  app.post('/', (req, response) => {
    MongoClient.connect(connectionString, {useUnifiedTopology: true}, function(err, db) {
      if (err) throw (err);
      urlCreator(db, function(userUrl){
        db.db("mydb").collection("saves").insertOne({url: userUrl, info: req.body}, function(err1, res) {
          if (err1) throw err1;
          console.log("1 document inserted");
          db.close();
          response.send(String(userUrl));
        });
      });
    });
  });

  app.post('/:save', (req, res) => {
    res.sendStatus(200);
    console.log(req.params["save"]);
    MongoClient.connect(connectionString, {useUnifiedTopology: true}, function(err, db) {
      if (err) throw (err);
      db.db("mydb").collection("saves").updateOne({url: parseInt(req.params["save"],10)}, { $set: {info: req.body} }, function(err5, res) {
        if (err5) throw err5;
        console.log(res.result);
        console.log("1 document updated");
        db.close();
      });
    });
  });

  function urlCreator(db, callBack){
    let url1 = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    console.log(url1);
    db.db("mydb").collection("saves").find({url: url1}).toArray(function(err3, res) {
      if (err3) throw err3;
      if(res.length == 0){
        callBack(url1);
      } else{
        urlCreator(callback);
      }
    });
  }

