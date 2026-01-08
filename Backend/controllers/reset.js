import userModel from '../models/usermodel.js';
import bcrypt from 'bcryptjs';

export const reset = async (req, res) => {
    try {
        const { email, newpass } = req.body;

        if (!email || !newpass) {
            return res.status(400).json({ success: false, message: "Please provide all required fields." });
        }

        // Find the user by email
        const user = await userModel.findOne({Email: email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Check if old password is correct
        // const isMatch = await bcrypt.compare(oldpass, user.password);
        // if (!isMatch) {
        //     return res.status(400).json({ success: false, message: "Old password is incorrect." });
        // }

        // Hash the new password

         const isMatch=await bcrypt.compare(newpass,user.password);

         if(isMatch) return res.status(400).json({success:false,message:"Already used password"});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newpass, salt);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ success: true, message: "Password updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};