const mongoose = require("mongoose");

const user = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
     email:{
        type:String,
        required:true
     },
     password:{
        type:String,
        required:true
     },
     token:{
      type:String,
      default:''
     },
     verified:{
      type:Boolean,
      default:'false'
     }
});

module.exports = mongoose.model("User",user);