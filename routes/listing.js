const express = require('express');
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js")
const listingController = require("../controllers/listings.js");
const { processAIQuery } = require("../utils/ai.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer ({storage});

// Middleware to validate the listing data
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

//index route and create route together using router.route
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,validateListing, upload.single('listing[image]'), wrapAsync(listingController.createListing))

//new route
router.get("/new", isLoggedIn, listingController.NewFormRender);

//show route, update route and delete route together user router.route
router.route("/:id")
    .get( wrapAsync(listingController.show))
    .put(isLoggedIn, isOwner, validateListing, upload.single('listing[image]'), wrapAsync(listingController.updateListing))
    .delete( isOwner, wrapAsync(listingController.deleteListing))


// edit route
router.get("/:id/edit", isLoggedIn, isOwner, listingController.editForm);

router.post("/ai-chat", wrapAsync( listingController.processAIQuery));



module.exports = router;