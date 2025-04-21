
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");


//Reviews route
//post route for reviews

module.exports.addReview = async (req, res) =>{

    let listing = await Listing.findById(req.params.id);
    if (!listing.geometry || !listing.geometry.type || !listing.geometry.coordinates) {
        listing.geometry = {
            type: "Point",
            coordinates: [0, 0] // Default coordinates (e.g., [0, 0])
        };
    }
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // Set the author to the logged-in user's ID
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New review added"); 
    res.redirect(`/listings/${listing._id}`);
 }

 //delete route for reviews
module.exports.deleteReview  =   async (req, res)=>{
    let { id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully"); 
    res.redirect(`/listings/${id}`);
}