import express from 'express'
import authuser from '../controllers/userauth.js'
import userlog from '../controllers/userlogin.js'
import isLoggedIn from '../middleware/isloggedin.js';
import logoutuser from '../controllers/logout.js';
import { fileURLToPath } from 'url';
import path from 'path';
import airoute from '../controllers/ai.service.js'
import user from '../models/usermodel.js';
import userModel from '../models/usermodel.js';
import { authcheck } from '../controllers/authcheck.js';
import UserActivity from '../models/userActivity.js';
import { reset } from '../controllers/reset.js';


const router=express.Router();
router.get('/signup',(req,res)=>{ 
    res.render('signup');
})
const __filename = fileURLToPath(import.meta.url); 
let __dirname = path.dirname(__filename); 
// let parentDir = path.join(__dirname, "..")
// parentDir = path.join(parentDir, "..")
// let reactPath = path.join(parentDir, "Frontend", "dist");



router.get('/api/check',isLoggedIn,authcheck);
// router.get('/page',(req,res)=>{
//     res.render('front');
// })

// router.get('/api/login',(req,res)=>{
//     res.render('login')
// })

// const dashpath = path.join(reactPath, "public")

router.get('/getUsername',isLoggedIn, (req, res) => {
    try {
        console.log("req",req.user.username)
        const username = req.user?.username || 'Anonymous';
        res.json({ 
            success: true, 
            username: username 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Failed to get username" 
        });
    }});

router.get('/home',isLoggedIn,(req,res)=>{
    if(req.session.user){
        console.log('worked')
        res.json({loggedin : true})
    } else{
        res.json({loggedin : false})
    }
})

router.get("/test",(req,res)=>{
    console.log("test")
    res.send("test")
})

// router.get('/profile',isLoggedIn,(req,res)=>{
//         const user = req.session.user;
//         if (user) {
//             res.render('profile', { user });
//         } else {
//             res.status(404).send('User not found');
//         }
// })




router.post('/get-code',async(req,res)=>{
    const {code}=req.body;
    if(!code) return res.status(404).send("Code is required!");
    const response=await airoute(code);
    res.send(response);
})

router.post('/createusers',authuser);
router.post('/login',userlog);

router.post('/forgot-password',reset)
router.get('/logout',logoutuser);
export default router;