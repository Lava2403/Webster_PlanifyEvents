const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/LoginSignUpDB")     //Name of DB is LoginSDignUpDB
.then(()=>{
    console.log("Mongodb Connected")
})
.catch(()=>{
    console.log("Failed to Connect")
})

const logInSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
})


const collection=new mongoose.model("Collection1",logInSchema)

module.exports=collection
