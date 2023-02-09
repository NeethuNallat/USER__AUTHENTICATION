const express = require('express');
const user_controll=require('../controllers/userController');
const auth=require("../middleware/auth")
const router=express.Router();

router.post('/register',user_controll.register)

router.post('/login', user_controll.login)

router.get('/test',auth,function(req,res){
    res.status(200).send({success:true,msg:"Authenticated"})

});


//update password

router.post('/update_password',user_controll.update_password);




module.exports=router;