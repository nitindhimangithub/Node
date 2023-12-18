import mongoose from "mongoose";
import envconfig from "./envConfig.js";

mongoose.connect(
    envconfig.DB_URL
)
.then(() =>{
    console.log("database connected");
})
.catch(() =>{
console.log("database not connected");
})