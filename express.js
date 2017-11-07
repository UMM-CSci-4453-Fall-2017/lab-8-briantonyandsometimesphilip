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
app.get("/click",function(req,res){
  // buttonID
  var btnID = req.param('id');
  var itemInfo = null;

  getItemInfo(DBF, btnID)
  .then(function (idResult) {
    itemInfo = idResult[0];
    console.log(itemInfo);
    return isValid(DBF, itemInfo.invID);
    })
  .then(function (existResult) {
    if (existResult[0].isValid) {
      // Increase amount by 1
      return increaseItemAmount(DBF, itemInfo);
    } else {
      // Create a new one
      return createItemRow(DBF, itemInfo);
    }
  })
  .then(function (dummy) {
    return transaction(DBF);
  })
  .then(function (currentTransaction) {
    res.send(currentTransaction);
  })
  .then(DBF.releaseDBF)
  .catch(function(err){console.log("DANGER:",err)});
});

function getItemInfo(setup , btnID) {
  var sql = 'select invID, label, price from Tony.till_buttons where buttonID = ' + btnID;
  setup.generateConnection();
  return setup.query(mysql.format(sql)); // Return a promise
}

function isValid(setup, invID) {
  var sql = 'select exists (select invID from Tony.current_trans where invID = ' + invID + ') as isValid';
  setup.generateConnection();
  return setup.query(mysql.format(sql)); // Return a promise
}

function increaseItemAmount(setup, itemInfo) {
  var sql = 'UPDATE Tony.current_trans SET amount = amount + 1 WHERE invID = ' + itemInfo.invID;
  setup.generateConnection();
  return setup.query(mysql.format(sql)); // Return a promise
}

function createItemRow(setup, itemInfo) {
  var sql = 'insert into Tony.current_trans values (' + itemInfo.invID + ',' + 1 + ',\"' + itemInfo.label + '\",' + itemInfo.price + ')';
  setup.generateConnection();
  return setup.query(mysql.format(sql)); // Return a promise
}

function transaction(setup) {
  var sql = 'select * from Tony.current_trans';
  setup.generateConnection();
  return setup.query(mysql.format(sql)); // Return a promise
}


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

    deleteItem(DBF, invID)
        .then(function (currentTransaction) {
            return transaction(DBF);
        })
        .then (function (currentTransaction) {
            res.send(currentTransaction);
            return currentTransaction;
        })
        .then(DBF.releaseDBF)
        .catch(function(err){console.log("DANGER:",err)});

});

function deleteItem(setup, invID) {
    var sql = 'Delete from Tony.current_trans where invID = ' + invID;
    setup.generateConnection();
    return setup.query(mysql.format(sql)); // Return a promise
}

app.listen(port);
