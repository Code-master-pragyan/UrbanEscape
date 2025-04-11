const express = require('express');
const mongoose = require("mongoose");
const router = express.Router({mergeParams: true});
const Listing = require("../models/listing.js")
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js");

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

//index route
router.get("/", async (req, res) => {
    const allListings = await Listing.find({});
    //console.log(allListings)
    res.render("./listings/index.ejs", { allListings });
})

//new route
router.get("/new", (req, res) => {
    res.render("./listings/new.ejs");
})

//create route
router.post("/", validateListing, wrapAsync(async (req, res, next) => {
    //console.log("Form Data:", req.body);
    const { title, description, price, location, country, "image.url": imageUrl } = req.body;
    const newListing = new Listing({
        title,
        description,
        price,
        location,
        country,
        image: { url: imageUrl } // Fix how the image is stored
    });

    await newListing.save();

    req.flash("success", "New listing created successfully!"); // Flash message for success
    //console.log("New listing saved:", newListing); // Debugging: Log the saved listing
    res.redirect("/listings"); // Redirect to listings page after saving
    // console.error("Error saving listing:", err); // Log the error         
    // res.status(500).send("Internal Server Error");
}));

//show route
router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ExpressError(400, "Invalid Listing ID"));
    }

    const singleList = await Listing.findById(id).populate("reviews");

    // If no listing is found, throw a 404 error
    // if (!singleList) {
    //     return next(new ExpressError(404, "Listing Not Found"));
    // }
    if(!singleList){
        req.flash("error", "Listing you are looking for does not exist");
        res.redirect("/listings");
    }

    res.render("./listings/show.ejs", { singleList });
}));

// edit route
router.get("/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you are looking for does not exist");
        res.redirect("/listings");
    }
    res.render("./listings/edit.ejs", { listing });
})

//update route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body })
    req.flash("success", "Listing Updated succesfully"); 
    res.redirect(`/listings/${id}`);
}))

//delete route 
router.delete("/:id", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    //console.log(deletedListing);
    req.flash("success", "Listing deleted"); 
    res.redirect("/listings");
})


module.exports = router;