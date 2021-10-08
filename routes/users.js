const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const expressValidator = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');


// GET registration form  //
router.get('/register', (req, res)=> {
  res.render('users/registerUser');
});

   

//POST registration form
router.post('/register', (req,res)=>{
  
  console.log(req.body)      // displays information from form


  const {first_name, last_name, email, password, password2 } = req.body;   //Pull required variables from form
  let errors = [];

  //check required fields
  if(!first_name || !last_name || !email || !password || !password2) {
    errors.push({msg: 'Please fill in all the fields'})    //Display fill in all fields if not field in
  }

  //check if the passwords match
  if(password !== password2) {
    errors.push({msg: 'Passwords do not match'});   //display msg is passwords do not match
  }

  //check password length should not be less than 6 characters
  if(password.length < 6) {
    errors.push({msg: "Password should be atleast 6 characters"});
  }
  
  //If errors are detected
  if(errors.length > 0) {
    res.render('users/registerUser', {   
      errors,                     // Display form with errors
      first_name,
      last_name,
      email,
      password,
      password2
    })
  }else {
    //res.send('pass')

    //Validation passed
    Registration.findOne({email:email})
      .then(user => {
        if(user) {
          //if the user exists display the msg
          errors.push({msg:'Email is already registered'});
          res.render('users/registerUser', {
            errors,                           // Display form with errors
            first_name,
            last_name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new Registration({   //Creating new user to Database
            first_name,
            last_name,
            email,
            password
          });  

         // console.log(newUser)
         // res.send('Hello new user');
          
         // Hash password
          bcrypt.genSalt(10, (err, salt) =>   //Generate hash password from plain text password
            bcrypt.hash(newUser.password, salt, (err, hash)=>{
                if(err) throw err;
                //Set password to hashed
                newUser.password = hash;
                //save user
                newUser.save()
                  .then(user => {
                    req.flash('success_msg', 'You have successfully registered');
                    res.redirect('/users/login');  //redirect to login page when use successfully registers
                  })
                  .catch(err => console.log(err)) //If error then it should print to console
          }))

        }
      });

  }


})

//RENDER the login page
router.get('/login', (req, res) => {
  res.render('users/login')
})

//POST the login form
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {        
    successRedirect: '/fileupload',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

 //RENDER the welcome page
router.get('/welcome', (req,res)=>{
  res.render('users/welcome')
})




module.exports = router;
