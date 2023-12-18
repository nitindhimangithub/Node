import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:false
    },
    email:{
        type:String,
        required:false
    },
    password:{
        type:String,
        required:false
    }
})
const User=mongoose.model('User',userSchema);
export default User;