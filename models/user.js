const mongoose = require('mongoose'),
      passportLocalMongoose = require('passport-local-mongoose');

var userSchema = mongoose.Schema({
    username: {type: String, unique: true, required: true}, 
    password: String,  
    firstName: String, 
    lastName: String,
    email: {type: String, unique: true, required: true}, 
    resetPasswordToken: String,
    resetPasswordExpires: String,
    isAdmin: {type: Boolean, default: false}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);