import jwt from 'jsonwebtoken';
import userModel from '../models/usermodel.js';

const isLoggedIn = async (req, res, next) => {
    console.log("isloggedin"
    )
    try {
        const token = req.cookies["user-token"];
        if (!token) {
            req.isAuthenticated=false;
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);  
        const user = await userModel.findById(decoded.id);

        if (!user) {
            req.isAuthenticated=false;
            return next();
        }
        req.user = user;
        req.isAuthenticated=true;
        next();
    } catch (err) {
        console.error(err);
        req.isAuthenticated=false;
       return next();
    }
};

export default isLoggedIn;
