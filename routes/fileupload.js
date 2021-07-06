const express = require("express");
const router = express.Router();
const multer = require('multer');


//allows to customise files
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


//view form route
router.get('/', (req,res)=>{
    res.render('fileupload/Deposit')
})

//post route for form
router.post('/upload', upload.single('avatar'),(req, res) => {
    return res.json({status:'OK'})
})



module.exports = router;