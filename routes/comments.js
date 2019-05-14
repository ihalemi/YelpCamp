// ======================================================================================
// COMMENTS ROUTES
// ======================================================================================

const express    = require('express'),
      router     = express.Router({mergeParams: true}), 
      Campground = require('../models/campground'), 
      Comment    = require('../models/comment'), 
      middleware = require('../middleware');

const { isLoggedIn, checkUserComment, isAdmin } = middleware;

// comments - NEW
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by ID
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            res.render("comments/new", {campground: campground});
        }
    })
});

// comments - CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    req.flash("error", "Something went wrong...");
                    console.log(err);
                }else{
                    // add username & id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save the comment
                    comment.save();
                    
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Comment added!");
                    res.redirect("/campgrounds/" +campground._id);
                }
            })
        }
    });
});

// comments - EDIT
router.get("/:commentId/edit", isLoggedIn, checkUserComment, function(req, res){
    res.render("comments/edit", {campground_id: req.params.id, comment: req.comment});
});

// comments - UPDATE
router.put("/:commentId", isAdmin, function(req, res){
    Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(err, comment){
        if(err){
           console.log(err);
            res.render("edit");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    }); 
});

// comments - DESTROY
router.delete("/:commentId", isLoggedIn, checkUserComment, function(req, res){
    // find campground, remove comment from comments array, delete comment in db
    Campground.findByIdAndUpdate(req.params.id, {
      $pull: {
        comments: req.comment.id
      }
    }, function(err) {
      if(err){ 
          console.log(err)
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.comment.remove(function(err) {
            if(err) {
              req.flash('error', err.message);
              return res.redirect('/');
            }
            req.flash('error', 'Comment deleted!');
            res.redirect("/campgrounds/" + req.params.id);
          });
      }
    });
});

module.exports = router;