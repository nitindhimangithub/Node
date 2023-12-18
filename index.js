import express from "express";
const app = express();
import './src/config/db.js'
import userRouter from './src/routes/userRoute.js';
app.use(express.json());
app.use('/api/v1',userRouter)

const port = 5000;
app.listen(port, () => {
    console.log(`server is running ${port}`);
    const error = false;
    if(error){
    console.log(`error running in sever`, error);
    }
    
})