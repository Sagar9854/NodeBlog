var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
// HOME PAGE BLOG POST
router.get('/', function(req, res, next) {
  var db = req.db;
  var posts = db.get('posts');
  posts.find({},{},function(err, posts){
  	res.render('index', {
  		"posts": posts
  	});
  });
});

module.exports = router;
