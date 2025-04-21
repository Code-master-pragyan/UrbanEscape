if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 3002;
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");
const Review = require("./models/review.js")
const { reviewSchema } = require("./schema.js");
const listingRoute = require("./routes/listing.js");
const reviewRoute = require("./routes/review.js");
const userRoute = require("./routes/user.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require ("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLAS_DB_URL;


main().then(() => {
    console.log("Connected to the mongodb");
})
    .catch((err) => {
        console.log(err);
    })
async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
})

store.on("error", ()=> {
    console.log("session store error");
})

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    }
}


 
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser", async(req, res)=> {
//     let fakeUser = new User({
//         email: "euyryr@gmail.com",
//         username: "demouser",
//     })

//     let registeredUser = await User.register(fakeUser, "demopassword");
//     res.send(registeredUser);
// })

app.use("/listings", listingRoute); // Mount the listing route
app.use("/listings/:id/reviews", reviewRoute); // Mount the review route
app.use("/", userRoute); // Mount the user route



app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
})

app.use((err, req, res, next) => {
    let { status = 500, message = "Internal serve5r error" } = err;
    //res.status(status).send(message);
    res.status(status).render("error.ejs", { message });
})

app.listen(port, () => {
    console.log(`server is running on port: ${port}`);
})
process.on("exit", (code) => {
    console.log(`Process exited with code: ${code}`);
});

process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down server...");
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down server...");
    process.exit(0);
});