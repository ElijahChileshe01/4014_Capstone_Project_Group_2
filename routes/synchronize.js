const express = require("express");
const router = express.Router();

router.get('/', (req,res)=>{
    res.render('synchronize/sync')
})

module.exports = router;