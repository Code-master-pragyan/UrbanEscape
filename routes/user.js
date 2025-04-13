const express = require('express');
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware.js');

router.get("/signup", (req, res) => {
    res.render("./users/signup.ejs");
})

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, password, email } = req.body;
        let newUser = new User({ username, email });
        let registeredUser = await User.register(newUser, password);
        //console.log(registeredUser);
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Welcome to UrbanEscape");
            res.redirect("/listings");
        })

    }
    catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }

}))

router.get("/login", (req, res) => {
    res.render("./users/login.ejs");
})

router.post("/login",saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
}), async (req, res) => {
    req.flash("success", "Welcome back to UrbanEscape!");
    res.redirect(res.locals.redirectUrl || "/listings");
})

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    })
})

module.exports = router;
