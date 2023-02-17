const express = require('express');
const user_controll=require('../controllers/userController');
const auth=require("../middleware/auth")
const router=express.Router();



// register

router.post('/register',user_controll.register)

//verify user

router.get('/verify_user', user_controll.verify_user)

//login

router.post('/login', user_controll.login)

//authentication

router.get('/test',auth,function(req,res){
    res.status(200).send({success:true,msg:"Authenticated"})

});


//update password

 router.post('/update_password',auth,user_controll.update_password);
// router.post('/update_password',user_controll.update_password);

 //forget paasword

 router.post('/forget_password',user_controll.forget_password);

 //Reset password

 router.post('/reset-password',user_controll.Reset_password)




module.exports=router;