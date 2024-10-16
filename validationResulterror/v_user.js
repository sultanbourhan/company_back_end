const {check , bode} = require("express-validator")

const validationMiddiel = require("./validationResulte")

const usermodel = require("../models/userModels")


exports.create_user_V = [
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

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE","ar-BH","ar-DZ","ar-SY","ar-MA"]).withMessage("the number is invalid"),

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

exports.get_user_ID_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    ,
    validationMiddiel
]

exports.update_user_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id"),

    check("email")
    .optional()
    .isEmail().withMessage("the email is incorrect")
    .custom((val)=>
        usermodel.findOne({email : val}).then((user)=>{
            if(user){
                throw new Error("email is availadle")
            }
        })   
    ),

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE","ar-BH","ar-DZ","ar-SY","ar-MA"]).withMessage("the number is invalid")

    ,
    validationMiddiel
]

exports.delete_user_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    ,
    validationMiddiel
]

exports.update_password_user_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id"),

    check("password")
    .notEmpty().withMessage("Enter your new password"),

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

exports.create_addresses_user_V = [
    check("address_location")
    .notEmpty().withMessage("Enter your sddress"),

    check("details")
    .notEmpty().withMessage("Enter your sddress details"),

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE","ar-BH","ar-DZ","ar-SY","ar-MA"]).withMessage("the number is invalid"),

    validationMiddiel
]

exports.delete_addresses_user_V = [
    check("addressesid")
    .isMongoId().withMessage("There is an error in id")
    ,
    validationMiddiel
]

exports.create_wichlist_user_V = [

    check("productid")
    .notEmpty().withMessage("Enter product")
    .isMongoId().withMessage("there is on id")
    ,
    validationMiddiel

]

exports.delete_wichlist_user_V = [

    check("productid")
    .notEmpty().withMessage("Enter product")
    .isMongoId().withMessage("there is on id")
    ,
    validationMiddiel

]