var express=require('express'),
Promise = require('bluebird'),
mysql=require('mysql'),
DBF = require('./dbf-setup.js'),
credentials=require('./credentials.json'),
app = express(),
port = process.env.PORT || 1337;

credentials.host='ids.morris.umn.edu'; //setup database credentials

var connection = mysql.createConnection(credentials); // setup the connection

connection.connect(function(err){if(err){console.log(error)}});

app.use(express.static(__dirname + '/public'));

// TODO for lab 9
// Get current user
// Change current user
app.get("/user", function(req,res) {

});

// return JSON object of current buttons
// modify values in till_buttons table (if you want to be fancy... NOT REQUIRED)
app.get("/buttons",function(req,res){
  var dbf = getDatabases(DBF)
  .then(function (results) {
    res.send(results);
  })
  .then(DBF.releaseDBF)
  .catch(function(err){console.log("DANGER:",err)});
});

var getDatabases=function(db){//Returns a promise that can take a handler ready to process the results
  var sql = "SELECT * from Tony.till_buttons";
  db.generateConnection();
  return db.query(mysql.format(sql)); //Return a promise
}

// update the current transaction table to reflect the-item button clicked
app.post("/click",function(req,res){
  var id = req.param('id');
  var sql = 'UPDATE Tony.till_inventory SET amount = amount + 1 WHERE ID = ' + id;
  console.log("is this the id of the thing?  " + id);
  console.log("Attempting sql ->"+sql+"<-");

  connection.query(sql,(function(res){return function(err,rows,fields){
     if(err){console.log("We have an insertion error:");
             console.log(err);}
     res.send(err); // Let the upstream guy know how it went
  }})(res));
});

// TODO for lab 9
// complete the current transaction and clear the transaction table
app.get("/sale", function(req, res) {

});

// TODO for lab 9
// abort the current transaction
app.get("/void", function(req,res) {

});

// provide JSON object of items in current transaction
app.get("/list", function(req,res) {

});

// remove item(s) from current transaction
app.delete("/delete", function(res,res) {

});

function rowExists(ID){
  var sql = mysql.format('SELECT EXISTS (SELECT ID FROM till_inventory WHERE ID = ' + ID + ')');

}
// Your other API handlers go here!

app.listen(port);
