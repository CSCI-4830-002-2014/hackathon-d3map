var express = require('express');
var async = require('async');
var app = express();


var mongo = require('mongoskin');
var db = mongo.db("mongodb://127.0.0.1:27017/" + process.env.DB, {native_parser:true});

console.log(process.env.DB);
console.log(process.env.BUSINESS);
console.log(process.env.REVIEW);
console.log(db);

app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

app.get('/query/:param1/:param2', function(req, res) {
    var param1 = req.params.param1.toUpperCase();
    var param2 = req.params.param2;
    var query = {"state" : param1};
    var projection = {};
    db.collection(process.env.BUSINESS)
        .find(query,projection)
        .sort( {review_count: -1 } )
        .limit(+param2)
        .toArray(function (err, businesses) {

            async.map(businesses,
                function(business, callback){
                    var query = {"business_id" : business.business_id,
                                 "votes.useful" : { $gt : parseInt(param2)}}; db.collection(process.env.REVIEW)
                      .find(query)
                      .limit(10)
                      .toArray(function (err, reviews){
                        business.reviews = reviews;
                        callback(err, business);
                      });
                },
                function(err, results){
                  console.log(results);
                  res.render("business_map", {data: results, param1: param1, param2: param2});
            });
    });
});

app.listen(3000);
console.log('listening on port 3000');
