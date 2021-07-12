//Import mongoose
const mongoose = require('mongoose');

//Create Schema
const registrationSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true},
    last_name:{
        type: String,
        required: true},
    email:{
        type: String,
        required: true},
    password:{
         type: String,
         required: true}
    }
);

//Export Schema                  // Model name is Registration
module.exports = mongoose.model('Registration', registrationSchema); 