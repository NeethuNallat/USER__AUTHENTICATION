const User = require("../models/userModel");
const bcryptjs = require("bcryptjs");
const config = require("../config/config");
const jwtToken = require("jsonwebtoken");


///Token

const create_token = async (id) => {
    try {
        const Token = await jwtToken.sign({ _id: id }, config.jwt);
        return Token;
    } catch (error) {
        res.status(400).send(error.message);

    }

}

const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10);
        return passwordHash;
    } catch (error) {
        res.status(400).send(error.message);
    }
}

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
            const userData = await  User.findOneAndUpdate({ email }, {
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

module.exports = {
    register,
    login,
    update_password
}