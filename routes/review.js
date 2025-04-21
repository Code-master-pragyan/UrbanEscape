const express = require('express');
const router = express.Router({mergeParams: true});
const mongoose = require("mongoose");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js")
const Listing = require("../models/listing.js")
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const { isLoggedIn, isAuthor } =require("../middleware.js");
const reviewController = require("../controllers/reviews.js");


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
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.addReview));

//delete route for reviews
router.delete("/:reviewId",isLoggedIn,isAuthor, wrapAsync (reviewController.deleteReview));

module.exports = router;