const express = require('express');
const router = express.Router({mergeParams: true});
const mongoose = require("mongoose");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js")
const Listing = require("../models/listing.js")
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");


// Middleware to validate the review data
const validateReview = (req, res, next) =>{
    let { error} = reviewSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//Reviews route
//post route for reviews
router.post("/",validateReview, wrapAsync( async (req, res) =>{
   // console.log("Submitted Review Data:", req.body);
   console.log("Review POST route triggered");  // Add this
   let listing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);

   listing.reviews.push(newReview);
   await newReview.save();
   await listing.save();
   req.flash("success", "New review added"); 
   res.redirect(`/listings/${listing._id}`);
}))

//delete route for reviews
router.delete("/:reviewId", wrapAsync ( async (req, res)=>{
    let { id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully"); 
    res.redirect(`/listings/${id}`);
}))

module.exports = router;