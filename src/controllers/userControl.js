import User from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { validateEmail, validatePassword, validateFullName } from "../validate/validation.js";
// const SECRET_KEY="NOTESAPI"
import envconfig from "../config/envConfig.js";
import transporter from "../middleware/emailConfig.js";
import { verifyToken } from "../middleware/verifyToken.js";

const userRegister = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }
    if (!validateFullName(fullName)) {
      return res.status(400).json({ message: "Invalid full name" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(401).json({ message: "This email is already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newDoc = new User({
      fullName,
      email,
      password: hashPassword,
    });

    const saveUser = await newDoc.save();
    if (saveUser) {
      return res.status(200).json({ message: "User registered successfully" });
    } else {
      return res.status(400).json({ message: "User not registered" });
    }
  } catch (error) {
    console.error("Error in user registration:", error);
    return res.status(500).json({ message: 'Error in user registration' });
  }
};


const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({ message: "user not found" });
    }
    const matchPassword =  await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(400).json({ message: "invalid credentials" });
    }
    const token = jwt.sign({ userId: existingUser._id, email: existingUser.email }, envconfig.SECRET_KEY)

    const userData = {token:token};
    return res.status(200).json({ message: "login succesfully", userData });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
};


const getAllUser = async (req, res) => {
  try {
    const getUser = await User.find({});
    if (!getUser) {
      return res.status(404).json({ message: "user  not found " });
    }
    else {
      return res.status(200).json({ message: "user  found", getUser });
    }
  }
  catch (error) {
    console.error("error", error)
    return res.status(500).json({ message: 'error in  get user ', error })
  }
}



// const deleteUser = async (req, res) => {
//   try {

//     let delUser = await User.findByIdAndDelete(req.params.id);

//     if (!delUser) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     else {

//       return res.status(200).json(delUser);
//     }
//   } catch (err) {
//     console.error("error", err)
//     return res.status(500).json({ message: 'error in delete user', err });
//   }
// };
const deleteUser = async (req, res) => {
  try {
      const token = req.header('Authorization')?.split(' ')[1]
      if (!token) {
          return res.status(401).json({ message: 'token is missing' });
      }
      const decode = jwt.verify(token, envconfig.SECRET_KEY);
      const delteUser = await User.findByIdAndDelete(decode.userId)
      if (!decode.userId) {
          return res.status(404).json({ message: 'id is missing in payload' });
      }
      if (!delteUser) {
          return res.status(500).json({ message: 'user not deleted' })
      } else {
          return res.status(201).json({ message: 'user deleted succesfully', delteUser });
      }
  } catch (error) {
      console.error("Error in updating user")
      return res.status(500).json({ message: 'error in deleting user' });
  }
}


// let getUserId = async (req, res, next) => {
//   try {
//     let getUser = await User.findById(req.params.id);
//     if (!getUser) {
//       return res.status(404).json({ message: "user not found" });
//     }
//     else {
//       return res.status(200).json({ message: "user found", getUser });
//     }
//   }
//   catch (error) {
//     console.error("error", error);
//     return next(error);
//   }
// }


// const getUserId = async (req, res) => {
//   try {
//       const token = req.header('Authorization')?.split(' ')[1]
//       if (!token) {
//           return res.status(401).json({ message: 'token is missing' });
//       }
//       const decode = jwt.verify(token, envconfig.SECRET_KEY);
//       const getUser = await User.findById(decode.userId)
//       if (!decode.userId) {
//           return res.status(404).json({ message: 'id is missing in payload' });
//       }
//       if (!getUser) {
//           return res.status(500).json({ message: 'user not find' })
//       } else {
//           return res.status(201).json({ message: 'user find successfully', getUser });
//       }
//   } catch (error) {
//       console.error("Error in finding user")
//       return res.status(500).json({ message: 'error in finding user' ,error });
//   }
// }
const getUserId = async (req, res) => {
  try {
    verifyToken(req, res, async () => {
      const { userId } = req.user; 
      
      if (!userId) {
        return res.status(404).json({ message: 'ID is missing in payload' });
      }
      
      const getUser = await User.findById(userId);
      
      if (!getUser) {
        return res.status(404).json({ message: 'User not found' });
      } else {
        return res.status(200).json({ message: 'User found successfully', getUser });
      }
    });
  } catch (error) {
    console.error("Error in finding user:", error);
    return res.status(500).json({ message: 'Error in finding user', error });
  }
};


let updateUserById = async (req, res, next) => {
  try {
    let userId = req.params.id;

    let updatedEmail = req.body.email;

    let updateUser = await User.findByIdAndUpdate(userId, { email: updatedEmail }, { new: true });

    if (!updateUser) {
      return res.status(404).json({ message: "user not update" });
    }
    else {
      return res.status(200).json({ message: "user update", updateUser });
    }
  }
  catch (error) {
    console.error("error", error);
    return next(error);
  }
}


const sendEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (email) {
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({ message: "Email not found", error });
      } else {
        const genToken = jwt.sign({ _id: user._id }, envconfig.SECRET_KEY, { expiresIn: '1h' });
        const link = `http://localhost:3000/reset-password/?token=${genToken}`;

        const sendMail = await transporter.sendMail({
          from: envconfig.EMAIL_USER,
          to: email,
          subject: 'Reset Password',
          html: `Click here to reset your password <a href= ${link}>click here</a> `
        })
        return res.status(200).json({ message: "Email is sent, please check your email" });
      }
    }

  } catch (error) {
    console.error("Error", error);
    return res.status(500).json({ message: "Error in sending email", error });
  }
}


const resetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  try {
    const token = req.query.token;
    const decodeToken = jwt.verify(token, envconfig.SECRET_KEY);
    const findUser = await User.findById(decodeToken._id);

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Password required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    else {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(newPassword, salt);
     const saveUser = await User.findOneAndUpdate(findUser._id, {$set: {password: hashPassword}})

      // findUser.password = hashPassword;
      // await findUser.save();

      return res.status(200).json({ message: "Reset password successful" });
    }

  } catch (error) {
    console.error("Error", error);
    return res.status(500).json({ message: "Error in reset password", error });
  }
};


const changePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(currentPassword, existingUser.password);
    if (!isValid) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    existingUser.password = hashedPassword;
    await existingUser.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in change password", error);
    return res.status(500).json({ message: "Error in changing password", error });
  }
};


export { userRegister, getAllUser, deleteUser, getUserId, updateUserById, Login, sendEmail, resetPassword,changePassword}








