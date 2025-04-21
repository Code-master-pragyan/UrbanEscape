const User = require("../models/user.js");
const mongoose = require("mongoose");
const passport = require("passport");

//signup form
module.exports.signupForm = (req, res) => {
    res.render("./users/signup.ejs");
}

//signup 
module.exports.signup = async (req, res) => {
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

}

//login form
module.exports.loginForm = (req, res) => {
    res.render("./users/login.ejs");
}

// login
module.exports.login = async (req, res) => {
    req.flash("success", "Welcome back to UrbanEscape!");
    res.redirect(res.locals.redirectUrl || "/listings");
}

//logout
module.exports.logout =  (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out");
        res.redirect("/listings");
    })
}