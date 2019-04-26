const mongodb = require('mongodb');
const DB_config = require('./config/db_config');
var MongoClient = mongodb.MongoClient;

MongoClient.connect(DB_config.DB_URL,{ useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  var dbo = db.db(DB_config.DB_name);
  dbo.collection(DB_config.collection_name).drop(function(err, delOK) {
    if (err) throw err;
    if (delOK) console.log("Collection deleted");
    db.close();
  });
});
