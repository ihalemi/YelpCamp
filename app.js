// ======================================================================================
// SETUP
// ======================================================================================

// configure dotenv
require('dotenv').config();

// Require Packages
const express        = require('express'),
      app            = express(),
      bodyParser     = require('body-parser'),
      mongoose       = require('mongoose'), 
      passport       = require('passport'), 
      localStrategy  = require('passport-local'), 
      methodOverride = require('method-override'), 
      flash          = require('connect-flash'), 
      cookieParser   = require('cookie-parser');

// Require Database Model & Seeding Logic
const User       = require('./models/user'),
      seedDB     = require('./seeds');

// Require Routes
const campgroundRoutes = require('./routes/campgrounds'), 
      commentsRoutes   = require('./routes/comments'), 
      authRoutes       = require('./routes/authentication');

// assign mongoose promise library and connect to database  
mongoose.Promise = global.Promise;

const databaseUri = process.env.DATABASEURL || 'mongodb://localhost/yelp_camp';

mongoose.connect(databaseUri, { 
    useNewUrlParser: true, 
    useCreateIndex: true 
}).then(() => {
    console.log(`Database connected`);
}).catch(err => {
    console.log(`Database connection error: ${err.message}`)
});

// CONFIGURATION
mongoose.set('useFindAndModify', false);
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(cookieParser('secret'));

//require moment
app.locals.moment = require('moment');

// seedDB();  // seed the database 

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: "Web development is tons of fun",
    resave: false, 
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// checks all routes if there is a current user logged in && set up flash messages 
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// ======================================================================================
// ROUTING
// ======================================================================================

app.use("/", authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentsRoutes);

// ======================================================================================
// LAUNCH SERVER 
// ======================================================================================
app.listen(process.env.PORT || 3000, process.env.IP, function() {
    console.log("The YelpCamp Server has started!");
});