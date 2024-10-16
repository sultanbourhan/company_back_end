const usermodel = require("../models/userModels")
const ApiError = require("../ApiError");

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const crypto = require("crypto")
const jsonwebtoken = require("jsonwebtoken");

const sendemail = require("../resetEmail")

// -----------------------------------
exports.sign_up = asyncHandler(  async (req,res, next)=>{

    if(req.body.role === "admin" || req.body.role === "employee" ){
        return next(new ApiError(`You can not be an admin ${req.body.role}`, 401))
    }
    
    
    const user = await usermodel.create({
        name : req.body.name,
        email : req.body.email,
        password : await bcrypt.hash(req.body.password, 12),
        passwordConfirm : req.body.passwordConfirm,
        phone : req.body.phone,
        role: req.body.role
    })

    const token = jsonwebtoken.sign(
        {userID : user._id},
        process.env.WJT_SECRET,
        {expiresIn: process.env.WJT_EXPIRESIN}
    )

    

    res.status(200).json({data:user , token})
})

// ---------------------------------------------
exports.login = asyncHandler(  async (req,res, next)=>{
    const user = await usermodel.findOne({email :req.body.email})

    if(!user || !await bcrypt.compare(req.body.password, user.password)){
        return next(new ApiError(`error email or password` , 401))
    }

    const token = jsonwebtoken.sign(
        {userID : user._id},
        process.env.WJT_SECRET,
        {expiresIn: process.env.WJT_EXPIRESIN}
    )

    user.active = true

    user.save()

    res.status(201).json({data : user , token})
})

// -------------------------------------------------
exports.check_login = asyncHandler(  async (req,res, next)=>{

    let token 

    // 1
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        token = req.headers.authorization.split(" ")[1]
    }else{
        return next(new ApiError("Enter token", 401))
    }

    // 2
    const codetoken = jsonwebtoken.verify(token , process.env.WJT_SECRET)

    // 3
    const user = await usermodel.findById(codetoken.userID)
    if(!user){
        return next(new ApiError(`user not valed token` , 401))
    }

    // 4
    if(user.password_Update_Time){
        if(parseInt(user.password_Update_Time.getTime() / 1000) > codetoken.iat){
            return next(new ApiError(`login again` , 401))
        }
    }

    // 5
    if(user.active === false){
        return next(new ApiError(`login again` , 401))
    }

    req.user = user

    next()

})

// ----------------------------------------------------
exports.check_user_role = (...roles) => asyncHandler(  async (req,res, next)=>{
    if(!roles.includes(req.user.role)){
        return next(new ApiError("You can not do this action", 403))
    }

    next()
})

// ---------------------------------------------------
exports.get_user_my = asyncHandler(  async (req,res, next)=>{

    const user = await usermodel.findById(req.user._id)

    res.status(201).json({data : user})
})

// ------------------------------------------------------
exports.update_user_my = asyncHandler( async (req,res,next)=>{

    if(req.body.name){
        req.body.slug = slugify(req.body.name)
    }

    const user = await usermodel.findOneAndUpdate(
        {_id : req.user._id},
        {
            name : req.body.name,
            slug : req.body.slug,
            email : req.body.email,
            phone : req.body.phone,
            profilImage : `${process.env.BASE_URL}/user/${req.body.profilImage}`,
        },
        {new: true}
    )
    if(!user){
        return next(new ApiError(`there is no user id ` , 404))
    }
    res.status(200).json({data:user})
})

// ---------------------------------------------------------
exports.update_user_password_my = asyncHandler( async (req,res,next)=>{

    const user = await usermodel.findOneAndUpdate(
        {_id : req.user._id},
        {
            password : await bcrypt.hash(req.body.newpassword, 12),
            password_Update_Time : Date.now()
        },
        {new: true}
    )
    if(!user){
        return next(new ApiError(`there is no user id ${id}` , 404))
    }

    const token = jsonwebtoken.sign(
        {userID : user._id},
        process.env.WJT_SECRET,
        {expiresIn: process.env.WJT_EXPIRESIN}
    )

    res.status(200).json({data:user, token})
})

// --------------------------------------
exports.logout = asyncHandler( async (req,res,next)=>{

    const user = await usermodel.findOneAndUpdate(
        {_id : req.user._id},
        {
            active : false
        },
        {new: true}
    )
    if(!user){
        return next(new ApiError(`there is no user id ${id}` , 404))
    }
    res.status(200).json({data:user})
})

// ------------------------------------------
exports.forgotpassord = asyncHandler( async (req,res,next)=>{

    const user = await usermodel.findOne({email : req.body.email})

    if(!user){
        return next(new ApiError(`There is no account with this email` , 404))
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    const resetCodeHash = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex")

    user.passwoedResetCode = resetCodeHash
    user.passwoedResetCodeDate = Date.now() + 10 * 60 * 1000
    
    user.save()

    await sendemail({
        email : user.email, 
        subject : "your password reset code (vaild for 10 min)",
        massage : ` csc ${resetCode} `
    })


    res.status(200).json({massage:"reset code"})


})