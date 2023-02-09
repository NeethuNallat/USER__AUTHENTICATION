const express=require("express");
const userRouter =require('./routes/userRoute')
const app = express();

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/ECOM",{
    useNewUrlParser:true
})
.then(()=> console.log("Database connection successfully"))
.catch((err)=>console.log("error connecting to mongoDb",err));

app.use(express.json())

app.use('/',userRouter)


app.listen(3001,function(){
    console.log("Server is Running On Port 3001")
})


app.use('/',userRouter)

