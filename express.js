var express=require('express'),
Promise = require('bluebird'),
mysql=require('mysql'),
DBF = require('./dbf-setup.js'),
credentials=require('./credentials.json'),
app = express(),
port = process.env.PORT || 1337;

credentials.host='ids.morris.umn.edu'; //setup database credentials

// Open the connection and a pool
DBF.generateConnection();

app.use(express.static(__dirname + '/public'));

// TODO for lab 9
// Get current user
// Change current user
app.get("/user", function(req,res) {

});

// return JSON object of current buttons
// modify values in till_buttons table (if you want to be fancy... NOT REQUIRED)
app.get("/buttons",function(req,res){
  var sql = "SELECT * from Tony.till_buttons";
  var dbf = queryPromiser(DBF, sql)
  .then(function (results) {
    res.send(results);
  })
  .catch(function(err){console.log("DANGER:",err)});
});

// update the current transaction table to reflect the-item button clicked
app.get("/click",function(req,res){
  // buttonID
  var btnID = req.param('id');
  var itemInfo = null;
  var itemInfoSql = 'select invID, label, price from Tony.till_buttons where buttonID = ' + btnID;

  queryPromiser(DBF, itemInfoSql)
  .then(function (idResult) {
    itemInfo = idResult[0];
    var validSql = 'select exists (select invID from Tony.current_trans where invID = ' + itemInfo.invID + ') as isValid';
    return queryPromiser(DBF, validSql);
  })
  .then(function (existResult) {
    if (existResult[0].isValid) {
      // Increase amount by 1
      var updateSql = 'UPDATE Tony.current_trans SET amount = amount + 1 WHERE invID = ' + itemInfo.invID;
      return queryPromiser(DBF, updateSql);
    } else {
      // Create a new one
      var insertSql = 'insert into Tony.current_trans values (' + itemInfo.invID + ',' + 1 + ',\"' + itemInfo.label + '\",' + itemInfo.price + ')';
      return queryPromiser(DBF, insertSql);
    }
  })
  .then(function (dummy) {
    var showSql = 'select * from Tony.current_trans';
    return queryPromiser(DBF, showSql);
  })
  .then(function (currentTransaction) {
    res.send(currentTransaction);
  })
  .catch(function(err){console.log("DANGER:",err)});
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
app.get("/delete", function(req,res) {
  // invID
  var invID = req.param('id');
  var sql = 'Delete from Tony.current_trans where invID = ' + invID;

  queryPromiser(DBF, sql)
  .then(function (currentTransaction) {
    var showSql = 'select * from Tony.current_trans';
    return queryPromiser(DBF, showSql);
  })
  .then (function (currentTransaction) {
    res.send(currentTransaction);
    return currentTransaction;
  })
  .catch(function(err){console.log("DANGER:",err)});

});

//Returns a promise that can take a handler ready to process the results
// Takes the imported db-setup and sql query string, and
// returns the result of the query as promise.
function queryPromiser(setup, sqlQuery) {
  return setup.query(mysql.format(sqlQuery)); // Return a promise
}

app.listen(port);
