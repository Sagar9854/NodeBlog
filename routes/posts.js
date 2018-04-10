var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer')

router.get('/show/:id', function(req, res, next){
	var posts = db.get('posts');
	posts.findOne({_id: req.params.id}, function (err, post) {
		res.render('show', {
			post: post
		});	
	});
});

router.get('/add',function(req,res,next){
	var categories = db.get('categories');
	categories.find({},{},function(err, categories){
		res.render('addpost',{
			title:"Add post",
			categories: categories
		});	
	});
});

var upload = multer({dest:'./public/images/uploads'});

router.post('/addcomment', function (req, res, next) {
	// GET THE FORM VALUES
	var name 		= req.body.name;
	var email    	= req.body.email;
	var body        = req.body.body;
	var postid      = req.body.postid;
	var commentdate = new Date();
	//form validation

	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('body', 'Body filed is required').notEmpty();

	//check for error
	var errors = req.validationErrors();

	if(errors){
		var posts = db.get('posts');
		posts.findOne({_id: postid}, function(err, post){
			res.render('show', {
				"errors": errors,
				"post": post
			});
		});
	}
	else{
		var comment = {"name":name, "email": email, "body":body, "commentdate":commentdate};
		var posts = db.get('posts');

		posts.update({
			"_id":postid
		},
		{
			$push:{
				"comments":comment
			}
		},
		function (err, doc) {
			if(err){
				throw err;
			}
			else{
				req.flash('success', 'Comment Posted');
				res.location('/posts/show/' + postid);
				res.redirect('/posts/show/' + postid);
			}
		}
		);
	}
});



router.post('/add', upload.single('mainimage'), function (req, res, next) {
	// GET THE FORM VALUES
	var title 		= req.body.title;
	var category    = req.body.category;
	var body        = req.body.body;
	var author      = req.body.author;
	var date        = new Date();

	if(req.file){
		var mainImageOriginalName = req.file.originalname;
		var mainImageName         = req.file.filename;
		var mainImageMime         = req.file.mimetype;
		var mainImagePath         = req.file.path;
		var mainImageExt          = req.file.extension;
		var mainImageSize         = req.file.size;
		console.log(mainImageOriginalName);
		console.log(mainImageName);
		console.log(mainImageMime);
		console.log(mainImagePath);
		console.log(mainImageExt);
		console.log(mainImageSize);
	}
	else{
		var mainImageName = "noimage.png"
	}

	//form validation

	req.checkBody('title', 'Title field is required').notEmpty();
	req.checkBody('body', 'Body filed is required').notEmpty();

	//check for error
	var errors = req.validationErrors();

	if(errors){
		res.render('addpost', {
			"errors": errors,
			"title": title,
			"body": body
		});
	}
	else{
		var posts = db.get('posts');

		//submit to db
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author,
			"mainimage" : mainImageName
		}, function (err, post) {
			if(err){
				res.send('There was an issue submitting the post');
			}
			else{
				req.flash('success', 'Post Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});

module.exports = router;