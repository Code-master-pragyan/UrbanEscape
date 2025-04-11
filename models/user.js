const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userschema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    }
});

userschema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userschema);

module.exports =User;
