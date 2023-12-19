import jwt from "jsonwebtoken";
import envconfig from "../config/envConfig.js";
// const SECRET_KEY = "NOTESAPI";



function verifyToken(req, res, next) {
  try {
    let token = req.headers.authorization;
    if (!token) {
        res.status(401).json({ message: "token not found" });
    } else{
    token = token.split(" ")[1];
      let user = jwt.verify(token,envconfig.SECRET_KEY); 
      req.user = user;
      next()
    }
  } catch (error) {
    console.error("error", error);
    res.status(401).json({ message: "invalid token", error });
  }
}

export { verifyToken };
