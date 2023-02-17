const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwtToken = require("jsonwebtoken");
const { EMAIL, PASSWORD } = require('../env');
const Mailgen = require('mailgen');

const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { findOneAndUpdate } = require("../models/userModel");


/**sent mail from real gmail account */

const sendResetPasswordMail = (name,email,text,instruction,link ) => { 
    let config = {
        service: 'gmail',
        auth: {
            user: EMAIL,
            pass: PASSWORD
        }
    }
    const transporter = nodemailer.createTransport(config)

    let Maingenarator = new Mailgen({
        theme: "default",
        product: {
            name: text,
            link: 'https://mailgen.js'
        }
    });

    let response = {
        body: {
            name: name,
            intro: 'Welcome to Mailgen! We\'re very excited to have you on board.',
            action: {
                instructions: 'To get started with Mailgen, please click here:',
                button: {
                    color: '#00FFFF', // Optional action button color
                    text:text,
                    link:link
                }
            },
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.',
            signature:false,
            greeting:false
        }
    }

    let mail = Maingenarator.generate(response)

    let message = {
        from: EMAIL,
        to: email,
        subject:text,
        html: mail
    }

    transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message Sent", info.response);
        }
    })
   
}


///Token/////////////////////////////////////////////////////////////////////////////////////////////////////////

const create_token = async (id) => {
    try {
        const Token = await jwtToken.sign({ _id: id }, config.jwt);
        return Token;
    } catch (error) {
        res.status(400).send(error.message);

    }

}

//secure password///////////////////////////////////////////////////////////////

const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10);
        return passwordHash;
    } catch (error) {
        res.status(400).send(error.message);
    }
}

//register////////////////////////////////////////////////////////////////////////////

const register = async (req, res) => {

    try {
        const {name,email,password} = req.body

        const spassword = await securePassword(password);
        
        const userData = await User.findOne({ email});
        
        
        if (userData) {
            res.status(200).send({ success: false, msg: "this email is already exists" });
        } else {
            const user = new User({
                name: name,
                email: email,                                                              // password:req.body.password, 
                password: spassword
                // image:req.file.filename,
                
            });
            const user_data = await user.save();
            const randomString=randomstring.generate()
            const data= await User.findOneAndUpdate({email},{$set:{
                token:randomString
            }});
            const text = 'verify your account'
            const instruction='To verify your account ,please click here:'
            const link=`http://localhost:4200/verifyaccount?token=${randomString}`
            sendResetPasswordMail(data.name, data.email, text, instruction, link)
            res.status(200).send({ success: true, message:"open the email and verify" });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }

}

//____________________veify user _______________________________________//

const verify_user=async(req,res)=>{
    try{
        const token=req.query.token
        const userData=await User.findOneAndUpdate({token}
            ,{
            $set:{
                verified:true,
                token:""
            }
        },{new:true}
        )
        console.log("userData",userData);
        if(userData){
            res.status(200).send({ success: true, message:"Your account has been verified",data:userData});
        }else{
          res.status(400).send({condition:false,message:"The link has been expired"})
        }
    }catch(error){
        res.status(400).send(error.message);

    }
}

//login method_______________________________________________

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const userData = await User.findOne({ email });
        // console.log(userData)

        if (userData) {
            const passwordMatch = await bcryptjs.compare(password, userData.password);
            if (passwordMatch) {
                const tokenData = await create_token(userData._id)
                const userResult = {
                    _id: userData._id,
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    token: tokenData
                }
                const response = {
                    success: true,
                    msg: "Login successfully........",
                    data: userResult
                }

                res.status(200).send(response);


            } else {

                res.status(200).send({ success: false, message: "Your details are incorrect" })
            }

        } else {
            res.status(200).send({ success: false, message: "Your details are incorrect" })

        }
    } catch (error) {
        res.status(400).send(error.message)

    }
}

//update password/////////////////////////////////////////////////////////////////////

const update_password = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const data = await User.findOne({ email });

        // console.log(data)
        if (data) {
            const newPassword = await securePassword(password);
            console.log(newPassword)
            const userData = await User.findOneAndUpdate({ email }, {
                $set: {
                    password: newPassword

                }
            });

            res.status(200).send({ success: true, msg: "Your password has been updated" });
        } else {

            res.status(200).send({ success: false, msg: "User Id not found !!..." });

        }


    } catch (error) {
        res.status(404).send(error.message);
    }

}

//forget_password//////////////////////////////////////////////////////////////////////////////////////////


const forget_password = async (req, res) => {

    try {

        const email = req.body.email;
        const userData = await User.findOne({ email });

        if (userData) {

            const randomString = randomstring.generate();
            const data = await User.findOneAndUpdate({ email }, { $set: { token: randomString } });
            console.log("hello");
            const instruction='Reset Password'
            const text='Reset Your password'
            const link=`http://localhost:4200/resert-password?token=${randomString}`
            sendResetPasswordMail(data.name,data.email,instruction,text,link);
            res.status(210).json({  msg: "Please check your inbox of  mail and reset your password" });

        } else {
            res.status(400).send({ success: false , msg: "this email is not exists" });

        }
    } catch (error) {
        res.status(404).send({ success: false, msg: error.message });
    }
}


/////// Reset password /////////////////////////////////////////////////////

const Reset_password=async(req,res)=>{ 

try{
    const token=req.query.token;
    const password=req.body.password;
    const newPassword=await securePassword(password);

    const userData=await User.findOneAndUpdate({token:token},
        {$set:{
        password:newPassword,
        token:''
    }
},{new:true});
   
    if(userData){
        res.status(200).json({ success: true, message:"user password has been reset...",data:userData });
    }else{
        res.status(400).json({ success: false,message:"this link has been expired........." });
    }
}catch(error){
    res.status(404).json({ success: false, message: "error.message" });
}

}

module.exports = {
    register,
    login,
    update_password,
    forget_password,
    Reset_password,
    verify_user
}