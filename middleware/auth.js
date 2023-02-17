
const jwtToken=require("jsonwebtoken");
const config=require("../config/config");


const verifyToken = async(req,res,next)=>{

    const token=  req.headers["autherization"];

    if(!token){+
        res.status(200).sent({success:false,msg:"A token is required for authentication"});
    }
    try{
       const decode= jwtToken.verify(token,config.jwt);
       req.user=decode;
       return next();
    }catch(error){
        res.status(400).send("Invalied Token");
    }

}

module.exports = verifyToken;
