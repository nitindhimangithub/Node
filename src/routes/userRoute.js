import express  from "express";
import { getAllUser, userRegister , deleteUser, getUserId,updateUserById,Login,sendEmail,resetPassword,changePassword} from "../controllers/userControl.js";
import {verifyToken} from "../middleware/verifyToken.js";
const router=express();
router.post('/register', userRegister);
router.post('/login',Login );
router.get('/getAllUsers', verifyToken,getAllUser);
router.delete('/deleteUsers/:id',deleteUser);
router.get('/getUsers', getUserId);
router.put('/updateUsers/:id',updateUserById);
router.post('/send-email',sendEmail);
router.post('/reset-password',resetPassword);
router.post('/changepassword',changePassword);

export default router;