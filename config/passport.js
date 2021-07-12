const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Load user model
const Registration = require ('../models/Registration');

module.exports = (passport) => {         //Take in passport object
    passport.use(
        new LocalStrategy({ usernameField: 'email'}, (email, password, done) => {       //use email when logging in  
            //match user
            Registration.findOne({ email: email})                             //Checking in if there is an email that matches
                .then(user => {
                    if(!user) {
                        return done(null, false, {message: 'The email is not registered'});     //if there is no match then display msg
                    }

                    //Match password
                    bcrypt.compare(password, user.password, (err, isMatch) => {     //Call compare method to compare plain text password and hashed password
                        if(err) throw err;

                        if(isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Password is incorrect'})   //If it does not match then display the msg
                        }
                    });
                })
                .catch(err => console.log(err))
        })
    );


//create sessions for user when the user logs in
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    Registration.findById(id, (err, user) => {
        done(err, user);
    });
});

}