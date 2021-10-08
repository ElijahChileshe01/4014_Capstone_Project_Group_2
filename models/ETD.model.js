const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    Creators_last_name: {type: String},
    Creators_first_name: {type: String},
    Title: {type: String},
    Date_of_Issue: {type: String},
    Publisher: {type: String},
    Citation: {type: String},
    Report_No: {type: String},
    Identifier: {type: String},
    Type_of_Publication: {type: String},
    Language: {type: String},
    Abstract: {type: String},
    Key_Words:  {type: String},
    File: {type: String}
});
//model
const ETDmodel = mongoose.model('form', formSchema);

//export schema
module.exports=ETDmodel;