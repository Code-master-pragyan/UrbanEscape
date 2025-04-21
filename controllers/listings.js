if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

//index route
module.exports.index = async (req, res) => {
    //console.log("QUERY:", req.query);
    const { category, search} = req.query;
    let filter = {};

    if (category) {
        filter.category = category;
    }
    if (search) {
        // Use regular expressions to search for both location and country
        filter.$or = [
            { location: { $regex: search, $options: 'i' } },  // Case-insensitive search for location
            { country: { $regex: search, $options: 'i' } }    // Case-insensitive search for country
        ];
    }
    const allListings = await Listing.find(filter);
    res.render("./listings/index.ejs", { allListings });
}

//new form route
module.exports.NewFormRender = (req, res) => {
    res.render("./listings/new.ejs");
}

//show route
module.exports.show = async (req, res, next) => {
    let { id } = req.params;

    // Check if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ExpressError(400, "Invalid Listing ID"));
    }

    const singleList = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author", model: "User" } }).populate("owner");

    if (!singleList) {
        req.flash("error", "Listing you are looking for does not exist");
        return res.redirect("/listings");
    }

    res.render("./listings/show.ejs", { singleList });
}

//create route 
module.exports.createListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send()

    let url = req.file.path;
    let filename = req.file.filename;
    // console.log("Form Data:", req.body);
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    newListing.geometry = {
        type: "Point",
        coordinates: response.body.features[0].geometry.coordinates
    };
    let savedListing = await newListing.save();
    req.flash("success", "New listing created successfully!"); // Flash message for success
    res.redirect("/listings"); // Redirect to listings page after saving
}

//edit route
module.exports.editForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you are looking for does not exist");
        return res.redirect("/listings");
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_300");
    res.render("./listings/edit.ejs", { listing, originalImageUrl });
}

//update route
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body });

    if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Listing Updated succesfully");
    res.redirect(`/listings/${id}`);
}

//delete route
module.exports.deleteListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    //console.log(deletedListing);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}