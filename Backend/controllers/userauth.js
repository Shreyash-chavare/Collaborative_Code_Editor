import usermodel from '../models/usermodel.js'
import tokenuser from '../utils/usertoken.js'
import bcrypt from 'bcryptjs'

const authuser = async (req, res) => {
    console.log(req.body);
    const fullname = req.body.fullname;
    const username = req.body.username;
    const password = req.body.password;
    const Email = req.body.email;

    try {
        // Check if email exists
        let existingEmail = await usermodel.findOne({ Email });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: `User with email ${Email} already exists`
            });
        }

        // Check if username exists
        let existingUsername = await usermodel.findOne({ username });
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: `Username ${username} is already taken`
            });
        }

        // Create new user
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        
        let usercreate = await usermodel.create({
            fullname,
            username,
            password: hash,
            Email
        });

        const token = tokenuser(usercreate);
        res.cookie("user-token", token);
        console.log("User created successfully");
        
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: usercreate._id,
                email: usercreate.Email,
                name: usercreate.fullname,
                username: usercreate.username
            }
        });

    } catch (err) {
        console.log(err);
        // Handle MongoDB duplicate key error
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `${field === 'Email' ? 'Email' : 'Username'} is already taken`
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
}

export default authuser;