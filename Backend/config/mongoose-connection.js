import mongoose from 'mongoose'
import  'dotenv/config';

const dbUri = process.env.DB_URI;

const mongo=mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(()=>{
    console.log("✅ Database connection established")
}).catch((err)=>{
    console.error("❌ MongoDB connection error:", err.message);
})
export default mongo;
