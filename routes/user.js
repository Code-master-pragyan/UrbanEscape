const express = require('express');
const mongoose = require("mongoose");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");

router.get("/signup", (req, res)=>{
    res.render("./users/signup.ejs");
})

router.post("/signup", wrapAsync( async(req, res)=>{
    try{
        let { username, password, email} = req.body;
    let newUser = new User({username, email});
    let registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.flash("success", "You have successfully signed up!");
    res.redirect("/login");
    } 
    catch(err){
        req.flash("error", err.message);
        res.redirect("/signup");
    }
    
}))

router.get("/login", (req, res)=>{
    res.render("./users/login.ejs");
})

router.post("/login", passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}), async (req, res)=>{
    req.flash("success", "Welcome back to UrbanEscape!");
    res.redirect("/listings");
} )

module.exports = router;
