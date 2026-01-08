import userModel from '../models/usermodel.js';
import tokenuser from '../utils/usertoken.js';
import bcrypt from 'bcryptjs';
import UserActivity from '../models/userActivity.js'; // Import the UserActivity model

const userlog = async (req, res) => {
    try {
        let { email, password } = req.body;

        const IsUser = await userModel.findOne({ Email: email });

        if (!IsUser) {
            return res.status(400).json({ 
                success: false,
                message: "User not found" 
            });
        }
        
        const userauthenticate = await bcrypt.compare(password, IsUser.password);
        if (userauthenticate) {
            const token = tokenuser(IsUser);
            res.cookie("user-token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            
            // Set session
            req.session.user = {
                id: IsUser._id,
                email: IsUser.Email,
                name: IsUser.username
            };
            
            // Save session explicitly
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Record login activity
            try {
                await UserActivity.create({
                    userId: IsUser._id,
                    activityType: 'login',
                    date: new Date()
                });
                console.log(`Recorded login activity for user: ${IsUser._id}`);
            } catch (activityError) {
                // Log the error but don't fail the login process
                console.error('Error recording user login activity:', activityError);
            }

            console.log("Login successfully");
            res.json({ 
                success: true, 
                message: "Login successful",
                user: {
                    id: IsUser._id,
                    email: IsUser.Email,
                    name: IsUser.name
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

export default userlog;