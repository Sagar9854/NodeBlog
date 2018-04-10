var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer');

router.get('/show/:category', function (req, res, next) {
	var db = req.db;
	var posts = db.get('posts');
	posts.find({category: req.params.category},{}, function (err, posts) {
		res.render('index', {
			"title": req.params.category,
			"posts": posts
		});
	});	
});

// ADD A CATEGORY TO BLOG POST
router.get('/add', function(req, res, next) {
  res.render('addCategory', {"title": "Add Category"});
});

var upload = multer({dest:'./public/images/uploads'});

router.post('/add', upload.single('mainimage'), function (req, res, next) {
	// GET THE FORM VALUES
	var title = req.body.title;
	//form validation

	req.checkBody('title', 'Title field is required').notEmpty();
	//check for error
	var errors = req.validationErrors();

	if(errors){
		res.render('addCategory', {
			"errors": errors,
			"title": title
		});
	}
	else{
		var categories = db.get('categories');
		//submit to db
		categories.insert({
			"title": title
		}, function (err, categories) {
			if(err){
				res.send('There was an issue submitting the post');
			}
			else{
				req.flash('success', 'A new category added');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

module.exports = router;
