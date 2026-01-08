import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    fullname: {
        type: String,
        minlength: 3,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    }
});


  

const user = mongoose.model("user", userSchema);
export default user;