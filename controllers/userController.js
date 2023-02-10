const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwtToken = require("jsonwebtoken");
const { EMAIL, PASSWORD } = require('../env');
const Mailgen = require('mailgen');

const nodemailer = require("nodemailer");
const randomstring = require("randomstring");


/**sent mail from real gmail account */

const sendResetPasswordMail = (name, email, token) => {
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
            name: "Mailgen",
            link: 'https://mailgen.js'
        }
    });

    let response = {
        body: {
            name: "Neethu.Nallat",
            intro: "Your bill has arrived",
            table: {
                data: [
                    {
                        item: "Nodemailer Stack Book",
                        description: "A Backend application",
                        price: "$10.99",
                    }
                ]

            },
            outro: "looking forward to do more business"

        }
    }

    let mail = Maingenarator.generate(response)

    let message = {
        from: EMAIL,
        to: email,
        subject: "Place order",
        html: mail
    }

    transporter.sendMail(message, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log("Message Sent", info.response);
        }
    })
    res.status(201).json("get bill succesfully......")

}

// const sendResetPasswordMail=async(name,email,token)=>{

//     try {
//       const transporter =await  nodemailer.createTransport({
//             host:'smtp.gmail.com',
//             port:587,
//             secure:false,
//             requireTLS:true,
//             auth:{
//                 user:config.emailUser,
//                 pass:config.emailPassword
//             }
//         });

//         const mailOptions={
//             from:config.emailUser,
//             to:email,
//             subject:'Fore reset password',
//             html:'<p>Hii '+name+ ',Please copy the link and <a href="localhost:3001/forget_password?token='+token+'"> reset your password </a> '
//         }
//         transporter.sendMail(mailOptions,function(error,infor){
//             if(error){
//                 console.log(error);
//             }else{
//                 console.log("Mail has been sent :- ",infor.response);
//             }
//         });

//     } catch (error) {
//         res.status(400).send({success:false,msg:message.error});
//     }

// }


///Token

const create_token = async (id) => {
    try {
        const Token = await jwtToken.sign({ _id: id }, config.jwt);
        return Token;
    } catch (error) {
        res.status(400).send(error.message);

    }

}

//secure password

const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10);
        return passwordHash;
    } catch (error) {
        res.status(400).send(error.message);
    }
}

//register

const register = async (req, res) => {

    try {

        const spassword = await securePassword(req.body.password);
        const user = new User({
            name: req.body.name,
            email: req.body.email,                                                                   // password:req.body.password, 
            password: spassword
            // image:req.file.filename,

        });

        const userData = await User.findOne({ email: req.body.email });

        if (userData) {
            res.status(200).send({ success: false, msg: "this email is already exists" });
        } else {
            const user_data = await user.save();
            res.status(200).send({ success: true, data: user_data });
        }
    } catch (error) {
        res.status(400).send(error.message);
    }

}

//login method

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
                    msg: "user details",
                    data: userResult
                }

                res.status(200).send(response);


            } else {

                res.status(200).send({ success: false, msg: "Your details are incorrect" })
            }

        } else {
            res.status(200).send({ success: false, msg: "Your details are incorrect" })

        }
    } catch (error) {
        res.status(400).send(error.message)

    }
}

//update password

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

//forget_password


const forget_password = async (req, res) => {

    try {

        const email = req.body.email;
        const userData = await User.findOne({ email });

        if (userData) {
            const randomString = randomstring.generate();
            const data = await User.findOneAndUpdate({ email }, { $set: { token: randomString } });
            console.log("hello");
            await sendResetPasswordMail(userData.name, userData.email, randomString)
            res.status(200).send({ success: true, msg: "Please check your inbox of  mail and reset your password" });

        } else {
            res.status(200).send({ success: true, msg: "this email is not exists" });

        }
    } catch (error) {
        res.status(404).send({ success: false, msg: error.message });
    }
}

module.exports = {
    register,
    login,
    update_password,
    forget_password
}