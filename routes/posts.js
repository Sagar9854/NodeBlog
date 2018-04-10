var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');
var multer = require('multer')

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