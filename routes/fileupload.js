const express = require("express");
const router = express.Router();
const multer = require('multer');
const request = require("request");
const fetch = require('node-fetch');
const fs = require('fs');
const http = require('https');
const { url } = require("inspector");
const rp = require('request-promise')
const path = require('path');
const mongoose = require ('mongoose')
const ETDmodel = require ('../models/ETD.model')
const expressValidator = require('express-validator');
const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false})
async = require('async');
FormData = require('form-data');
sleep = require('sleep');
mkdirp = require('mkdirp');
xml2js = require('xml2js');
DomParser = require('dom-parser');
xml2json = require('xml-to-json')

// router.use(bodyParser())


//Specifies destination of PDF file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public');
    },
//specifying that it should be saved with the original name
    filename: (req, file, cb) => {
        const { originalname } = file;  
        cb(null, originalname);
    }
})


//specify destination of upload
const upload = multer({storage});


//View the Metadata Form
router.get('/form', (req, res) => {
    res.render('fileupload/form')
})

 router.post('/form', 
 [
    check('Creators_last_name', 'Authors Last Name is not Valid').notEmpty(),
    check('Creators_first_name', 'Authors First Name is not Valid').notEmpty(),
    check('Title','Title is not Valid').notEmpty(),
    check('Date_of_Issue','Date is Invalid').notEmpty(),
    check('Publisher','Publisher is not Valid'),
    check('Citation','Citation is not Valid').notEmpty(),
    check('Report_No','Report Number is not Valid').notEmpty(),
],
    async (req, res) => {
    // console.log(req.body)
    let forms = new ETDmodel ({
        Creators_last_name: req.body.Creators_last_name,
        Creators_first_name: req.body.Creators_first_name,
        Title: req.body.Title,
        Date_of_Issue: req.body.Date_of_Issue,
        Publisher: req.body.Publisher,
        Citation: req.body.Citation,
        Report_No: req.body.Report_No,
        Identifier: req.body.Identifier,
        Type_of_Publication: req.body.Type_of_Publication,
        Language: req.body.Language,
        Abstract: req.body.Abstract,
        Key_Words: req.body.Key_Words,
        File: req.body.file 
    })
    {
        const errors = validationResult(req)
        console.log(errors)
        if(!errors.isEmpty()){
            const alert = errors.array()
            res.render('fileupload/form', {
                alert
            })
            return;
        }
    }
    try{
        forms = await forms.save()
        console.log(forms)
        res.redirect('/fileupload/viewsubmissions')
    } catch (error) {
        console.log(error)
    }
});




//view form route
router.get('/', (req,res)=>{
    res.render('fileupload/Deposit')
})


//  router.post('/upload', upload.single('file'), async (req, res) => {
//      console.log(req.body)
//     // res.redirect('viewsubmissions')

// })

router.post('/upload', upload.single('file'), async (req, res) => {


    //var url = 'curl -v --form input=@./thefile.pdf localhost:8070/api/processHeaderDocument',
    
    //const params = {object} options
  
    //setting options
  
    function init() {
        var options = new Object();
      
          // start with the config file
          //const config = require('../config.json');
          options.grobid_host = "localhost";
          options.grobid_port = "8070";
          options.sleep_time = 5000;
          options.outPath = '/home/elijah/Desktop/pdfs'
          options.obj ="";
          // default service is full text processing
          options.action = "processHeaderDocument";
          options.concurrency = 2; // number of concurrent call to GROBID, default is 10
          var attribute; // name of the passed parameter
          // get the path to the PDF to be processed
          options.parser="";
      
         // options.concurrency = 10; // number of concurrent call to GROBID, default is 10
          var attribute; // name of the passed parameter
          // get the path to the PDF to be processed
          return options;
        }
      
             
        
      function callGROBID(options, file, callback) {
          console.log("---\nProcessing: ");
      //const params = {}   
          var form = new FormData();
          form.append("input", fs.createReadStream(path.join ("/home/elijah/Desktop/4014_CP/Demo/ETSA/4014_Capstone_Project_Group_2/public/"+file)));
          form.append("consolidateHeader", "1");
          form.append("consolidateCitations", "0");
          //form.append("Accept: application/x-bibtex");
          var grobid_url = "http://" + options.grobid_host;
          if (options.grobid_port) 
              grobid_url += ':' + options.grobid_port
          grobid_url += '/api/'; 
          form.submit(grobid_url+options.action, function(err, res, body) {
             console.log(grobid_url+options.action);
             console.log('grobid has started');
             
              if (err) {
                  console.log(err);
                  return false;
              }
      
              if (!res) {
                  console.log("GROBID service appears unavailable");
                  //return false;
              } else {
                 res.setEncoding('utf8');
              }
      
              if (res.statusCode == 503) {
                  // service unavailable, normally it means all the threads for GROBID on the server are currently used 
                  // so we sleep a bit before retrying the process
                  sleep.sleep(options.sleep_time); 
                  return callGROBID(options, file, callback);
              } else if (res.statusCode == 204) {
                  // success but no content, no need to read further the response and write an empty file
                  return true;
              } else if (res.statusCode != 200) {
                  console.log("Call to GROBID service failed with error " + res.statusCode);
                  return false;
              }
            console.log('process done-----------now making boody')
              var body = "";
              res.on("data", function (chunk) {
                  body += chunk;
              });
              
              //console.log(body);
              //res.send(body);
             
              res.on("end", function () {
                  mkdirp(options.outPath, function(err, made) {
                     
                     
                      xml2json({
                          input: options.outPath+"/"+file,
                          output: 'null'
                      }, function(err, result) {
                        
                          if(err) {
                              console.error(err);
                          } else {
                              console.log("HERE ARE THE RESULTS")
                              console.log(result);
                          }
                        
                      });
                     
                     
                     
                     
                     
                     
                     
                     
                      // I/O error
                      if (err) 
                          return cb(err);
      
                          
      
                      // first write the TEI reponse 
                      var jsonFilePath = options.outPath+"/"+file.replace(".pdf", ".tei.xml");
                      fs.writeFile(jsonFilePath, body, 'utf8', 
      
                     
                      
                          function(err, ) { 
                              if (err) { 
                                  console.log(err);
                              } 
                              console.log( "TEI response written under: " + jsonFilePath); 
                              
                             
                            // xmldata = JsonStringfy(body, "json/xml");
      
                              
      
                             //obj = JSON.parse(body);
                             console.log(body);
                             
                              callback();
                          }
                      );
                  });
              });
      
      
      
              
           //  callback();
            
          });
      }
      
      
      function processGROBID(options) {
          // get the PDF paths
          var listOfFiles = getFiles(path.join ("/home/elijah/Desktop/4014_CP/Demo/ETSA/4014_Capstone_Project_Group_2/public"));
          console.log("found " + listOfFiles.length + " files to be processed");
          
          var q = async.queue(function (file, callback) {
              callGROBID(options, file, callback);
             // console.log(body)
          }, options.concurrency);
          
        
      
          q.drain = function() {
              console.log( "\nall tasks completed!");
              
          }
      
          for(var i = 0; i < listOfFiles.length; i++) {
              q.push(listOfFiles[i], function (err) {  
                  if (err) { 
                      return console.log('error in adding tasks to queue'); 
                  }  
                  console.log('task is completed');  
              });
          }
          
      }
      
      // get file
      
      function getFiles(dir) {
          var fileList = [];
          var files = fs.readdirSync(dir);
          for (var i=0; i<files.length; i++) {
              if (fs.statSync(path.join(dir, files[i])).isFile()) {
                  if (files[i].endsWith(".pdf") || files[i].endsWith(".PDF"))
                      fileList.push(files[i]);
              }
          }
          return fileList;
      }
      
      function start() {
          var options = init();
          start = new Date()
          processGROBID(options);
          console.log("function ends");
      }
         start();
         
      
         
      /**
       * Process a PDF file by calling the entity-fishing service and enrich with the resulting
       * JSON
       * @param {object} options object containing all the information necessary to manage the paths:
       *  - {object} inPath input directory where to find the PDF files
       *  - {object} outPath output directory where to write the results
       *  - {string} profile the profile indicating which filter to use with the entity-fishing service, e.g. "species"
       * @return {undefined} Return undefined
       */
      
      
      
      
      
        
      
        /*let todo = {
            userId: 123,
            title: "loren impsum doloris",
            completed: false
        };
        */
         // let path = '/home/slim/Desktop/pdfs'
      
        /*fetch('localhost:8070/api/processHeaderDocument', {
            
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            input: path
        }).then(res => res.json())
          .then(json => console.log(json));*/
      
      
          
            console.log('end;;;;;;;;;;;;;;');
         
      
    //   return res.json({status:'OK'},) 
  res.redirect('/fileupload/form')
  
  
  
  
  
      
  
  });
  
    
  
  
//View Submissions Route  
router.get('/viewsubmissions', (req, res) => { 
    ETDmodel.find((err, forms) => {
        if (!err) 
        { 
            console.log(forms); 
            res.render('fileupload/Submissions', {
                etdList: forms
            });
        } else {
            console.log('Cannot display users details');
        }
    })
})


// View Indivdual Users Details
router.get('/viewsubmissions/view/:id', (req, res) => {
    ETDmodel.find({_id: req.params.id}, (err, forms) => {
        if(err) res.json(err);
            else res.render('fileupload/individualSub', {etdList: forms});
        });
});



//delete individual users records   
router.get('/viewsubmissions/delete/:id', (req, res) => {
    ETDmodel.findByIdAndDelete({_id: req.params.id}, (err, forms) => {
        if(err) res.redirect('/');
        else res.redirect('/fileupload/viewsubmissions');
    });
});



module.exports = router;