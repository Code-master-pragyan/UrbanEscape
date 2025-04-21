const express = require('express');
const mongoose = require("mongoose");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require('../middleware.js');
const userController = require("../controllers/users.js");

// signup form and signup together using router.route
router.route("/signup")
    .get(userController.signupForm)
    .post(wrapAsync(userController.signup))

// login form and  login together using router.route
router.route("/login")
    .get(userController.loginForm)
    .post(saveRedirectUrl, passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true,
    }), userController.login);

// logout
router.get("/logout", userController.logout);

module.exports = router;
