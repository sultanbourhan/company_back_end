const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1 
const userSchema = new mongoose.Schema({
    name : {
        type: String,
        require: [true, "require"],
    },

    slug : {
        type: String,
        lowercase: true,
    },

    profilImage: String,

    email : {
        type : String,
        require: [true, "require"],
        lowercase: true,
    },

    phone : String,

    password : {
        type : String,
        require: [true, "require"],
        minlemgth : [5, "minlemgth"]
    },

    password_Update_Time : Date,

    passwoedResetCode : String,

    passwoedResetCodeDate : Date,

    passwoedResetCodeVerified : Boolean,

    role : {
        type : String,
        enum : ["user", "admin" , "employee"],
        default : "user",
    },

    active : {
        type : Boolean,
        default : true,
    },

    points : {
        type : Number,
        default : 20
    },

    verificationCode: { type: Number },

},{timestamps: true})


const usermodel = mongoose.model("user", userSchema)

module.exports = usermodel