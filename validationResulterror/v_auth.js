const {check , bode} = require("express-validator")

const validationMiddiel = require("./validationResulte")

const usermodel = require("../models/userModels")

const slugify = require("slugify");
const bcrypt = require("bcryptjs");

exports.sign_up_V = [
    check("name")
    .notEmpty().withMessage("Enter your name"),

    check("email")
    .notEmpty().withMessage("Enter your email")
    .isEmail().withMessage("the email is incorrect")
    .custom((val)=>
        usermodel.findOne({email : val}).then((user)=>{
            if(user){
                throw new Error("email is availadle")
            }
        })   
    ),

    check("password")
    .notEmpty().withMessage("Enter your password")
    .isLength({min: 5}).withMessage("the password is short"),

    check("passwordConfirm")
    .notEmpty().withMessage("Enter your passwordConfirm")
    .custom((val , {req})=>{
        if(val !== req.body.password){
            throw new Error("the password is incorrect")
        }

        return true  
    })

    ,
    validationMiddiel
]

exports.login_V = [
    // check("email")
    // .notEmpty().withMessage("Enter your email")
    // .custom((val)=>
    //     usermodel.findOne({email : val}).then((user)=>{
    //         if(!user){
    //             throw new Error("Error email or password")
    //         }
    //     })
    // )
    // ,

    // check("password")
    // .notEmpty().withMessage("Enter your password")
    // ,
    validationMiddiel
]

exports.update_user_my_V = [
    check("name")
    .notEmpty().withMessage("Enter your name"),
    
    check("phone")
    .optional()
    .isMobilePhone(["ar-AE","ar-BH","ar-DZ","ar-SY","ar-MA"]).withMessage("the number is invalid")
    ,
    validationMiddiel
]

exports.update_user_password_my_V = [
    check("password")
    .notEmpty().withMessage("Enter your password")
    .custom(async (val , {req})=>{
        const user = await usermodel.findById(req.user._id)
        
        if(!user){
            throw new Error("not user")
        }

        const pass = await bcrypt.compare(val , user.password)


        if(!pass){
            throw new Error("the password is incorrect")
        }

        return true
    }),

    check("newpassword")
    .notEmpty().withMessage("Enter your new password"),

    check("newpasswordConfirm")
    .notEmpty().withMessage("Enter your new password Confirm")
    .custom((val , {req})=>{
        if(val !== req.body.newpassword){
            throw new Error("the newpassword is incorrect")
        }

        return true
    })
    ,
    validationMiddiel
]


exports.forgotpassord_V = [
    check("email")
    .notEmpty().withMessage("Enter your email")
    .custom((val)=>
        usermodel.findOne({email : val}).then((user)=>{
            if(!user){
                throw new Error("Email error")
            }
        })  
    )
    ,
    validationMiddiel
]