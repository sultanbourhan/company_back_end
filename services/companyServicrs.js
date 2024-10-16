const companymodel = require("../models/companyModels");
const ApiError = require("../ApiError");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const multer = require("multer");
const sharp = require('sharp');
const { v4: uuidv4 } = require("uuid");
const { text } = require("body-parser");

// --------------------------------------------

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    } else {
        cb(new ApiError("The uploaded file is not an image", 400), false);
    }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter }).fields([
    { name: 'companyImage', maxCount: 1 },
    { name: 'logoImage', maxCount: 1 },
    { name: 'Image', maxCount: 1 }
]);

// تستخدم .fields لذا احذف imgcompany و imgcompanyLogo
exports.uploadImages = upload;

// معالجة الصورة الخاصة بالشركة
exports.resizeImg = asyncHandler(async (req, res, next) => {
    if (req.files.companyImage) {
        const file = req.files.companyImage[0]; // يأخذ أول ملف في المصفوفة
        const filename = `company-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(file.buffer)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`image/company/${filename}`);

        req.body.companyImage = filename;
    }
    next();
});

// معالجة شعار الشركة
exports.resizeImglogo = asyncHandler(async (req, res, next) => {
    if (req.files.logoImage) {
        const file = req.files.logoImage[0]; // يأخذ أول ملف في المصفوفة
        const filename = `company-logo-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(file.buffer)
            .resize(600, 600)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`image/company/${filename}`);

        req.body.logoImage = filename;
    }
    next();
});

exports.resizeImage = asyncHandler(async (req, res, next) => {
    if (req.files && req.files.Image) {
        const file = req.files.Image[0]; // يأخذ أول ملف في المصفوفة
        const filename = `company-Image-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(file.buffer)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`image/company/${filename}`);

        req.body.Image = `localhost:8000/company/${filename}`;
    }
    next();
});

// ----------------------------------------------------
exports.create_company = asyncHandler(async (req, res) => {
    req.body.slug = slugify(req.body.name);

    const company = await companymodel.create({
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        companyImage: `${process.env.BASE_URL}/company/${req.body.companyImage}`,
        logoImage: `${process.env.BASE_URL}/company/${req.body.logoImage}`,
        user: req.body.user,
        phone: req.body.phone,
        linkedIn: req.body.linkedIn,
        facebook: req.body.facebook,
        instagram: req.body.instagram,
    });

    res.status(201).json({ data: company });
});

// ------------------------------------------------------------
exports.get_company =asyncHandler( async (req, res, next)=>{

    // page
    const page = req.query.page *1 || 1 
    const limit = req.query.limit *1 || 10
    const skip = (page - 1) * limit
    const inIndex = page * limit

    // filter
    const reqQuery = {...req.query}
    const del_for_reqQuery = ["page", "limit", "sort", "fields"]
    del_for_reqQuery.forEach((val) => delete reqQuery[val])
    
    // { price: { $gte: '400' }, ratingsAverage: { $gte: '1' } }
    // { price: { gte: '400' }, ratingsAverage: { gte: '1' } }
    let reqQueryArrae = JSON.stringify(reqQuery)
    reqQueryArrae = reqQueryArrae.replace(/\b(gte|lte|lt|gt)\b/g, (match)=> `$${match}`)
    let reqQueryJson = JSON.parse(reqQueryArrae)

    // number page
    const Allcompany = await companymodel.countDocuments()

    const pagination = {}
    pagination.page = page
    pagination.limit = limit
    pagination.Allcompany = Allcompany
    pagination.numberOfPage = Math.ceil(Allcompany / limit)
    if(inIndex < Allcompany){
        pagination.nextPage = page + 1
    }
    if(skip > 0){
        pagination.prevPage = page - 1
    }



    let companyDB = companymodel.find(reqQueryJson).limit(limit).skip(skip)

    // sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(",").join(" ")
        companyDB = companyDB.sort(sortBy)
    }

    // select fields
    if(req.query.fields){
        const fieldsBy = req.query.fields.split(",").join(" ")
        companyDB = companyDB.select(fieldsBy)
    }else(
        companyDB = companyDB.select("-__v")
    )

    // search
    if (req.query.keyword) {
        const search = {}
        search.$or = [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { description: { $regex: req.query.keyword, $options: "i" } },
        ]

        companyDB = companyDB.find(search);

    }

    const company = await companyDB

    res.status(200).json({results : company.length, pagination, data : company})

})

// -------------------------------------------------------------
exports.get_company_id =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findById(req.params.id).populate({path: "user"})

    if(!company){
        return next(new ApiError(`There is no company account for this ID ${req.params.id}.` , 404))
    }
    
    res.status(201).json({data:company})
})

// ------------------------------------------------------
exports.get_company_my =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findOne({user: req.user._id}).populate({path: "user"})

    if(!company){
        return next(new ApiError(`You do not have a company account.` , 404))
    }

    res.status(201).json({data:company})
})

// --------------------------------------------------------

exports.update_company_my =asyncHandler( async (req, res, next)=>{

    if(req.body.name){
        req.body.slug = slugify(req.body.name)
    }

    const company = await companymodel.findOneAndUpdate(
        {user : req.user._id},
        {
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
            companyImage: `${process.env.BASE_URL}/company/${req.body.companyImage}`,
            logoImage: `${process.env.BASE_URL}/company/${req.body.logoImage}`,
            phone: req.body.phone,
            linkedIn: req.body.linkedIn,
            facebook: req.body.facebook,
            instagram: req.body.instagram,
        },
        {new: true}
    )

    if(!company){
        return next(new ApiError(`You do not have a company account.` , 404))
    }

    res.status(200).json({data:company})
})

// ----------------------------------------------------------
exports.update_company_id =asyncHandler( async (req, res, next)=>{
    if(req.body.name){
        req.body.slug = slugify(req.body.name)
    }

    const company = await companymodel.findOneAndUpdate(
        {_id : req.params.id},
        {
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
            companyImage: `${process.env.BASE_URL}/company/${req.body.companyImage}`,
            logoImage: `${process.env.BASE_URL}/company/${req.body.logoImage}`,
            phone: req.body.phone,
            linkedIn: req.body.linkedIn,
            facebook: req.body.facebook,
            instagram: req.body.instagram,
        },
        {new: true}
    )

    if(!company){
        return next(new ApiError(`There is no company account for this ${req.params.id}.` , 404))
    }

    res.status(200).json({data:company})
})

// ----------------------------------------------------------
exports.delete_company_id =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findByIdAndDelete(req.params.id)

    if(!company){
        return next(new ApiError(`There is no company account for this ${req.params.id}.` , 404))
    }

    res.status(200).send()

})

// ----------------------------------------------------------
exports.delete_company_my =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findOneAndDelete({user: req.user._id})

    if(!company){
        return next(new ApiError(`There is no account for your company.` , 404))
    }

    res.status(200).send()
})

// --------------------------------------------------------------
exports.create_company_advertisements_my =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findOneAndUpdate(
        {user: req.user._id},
        {
          $addToSet : {advertisements : req.body}
        },
        {new: true}
    )

    if(!company){
        return next(new ApiError(`There is no account for your company.` , 404))
    }

    res.status(200).json({data:company})
})

// ---------------------------------------------------------
exports.delete_company_advertisements_my =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findOneAndUpdate(
        {user: req.user._id},
        {
          $pull : {advertisements : {_id : req.params.id}}
        },
        {new: true}
    )

    if(!company){
        return next(new ApiError(`There is no account for your company.` , 404))
    }

    res.status(200).send()
})

// --------------------------------------------------------
exports.get_company_advertisements_my =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findOne({user: req.user._id}).populate({path: "user"})

    if(!company){
        return next(new ApiError(`You do not have a company account.` , 404))
    }

    res.status(201).json({number : company.advertisements.length, data:company.advertisements})
})

// --------------------------------------------------------
exports.create_company_comments =asyncHandler( async (req, res, next)=>{

    req.body.user_comment = req.user._id

    const company = await companymodel.findOneAndUpdate(
        {_id: req.params.id},
        {
            $addToSet : {comments : req.body}
        },
        {new: true}
    )

    if(!company){
        return next(new ApiError(`There is no company account for this ID ${req.params.id} .` , 404))
    }

    res.status(200).json({data:company})

})

// --------------------------------------------------
exports.delete_company_comments_my = asyncHandler(async (req, res, next) => {
    // العثور على الشركة والتعليق المطلوب
    const company = await companymodel.findOne({ _id: req.params.companyId, "comments._id": req.params.commentId });

    // التحقق من وجود الشركة والتعليق
    if (!company) {
        return next(new ApiError(`There is no company account for this ID ${req.params.companyId} or comment with ID ${req.params.commentId}.`, 404));
    }

    // العثور على التعليق والتحقق من أن المستخدم هو نفس المستخدم الذي كتب التعليق
    const comment = company.comments.id(req.params.commentId);
    if (comment.user_comment.toString() !== req.user._id.toString()) {
        return next(new ApiError(`You are not authorized to delete this comment.`, 403));
    }

    // استخدام $pull لحذف التعليق
    await companymodel.findOneAndUpdate(
        { _id: req.params.companyId },
        { $pull: { comments: { _id: req.params.commentId } } }
        ,
        {new: true}
    );

    // إعادة استرجاع الشركة المحدثة
    const updatedCompany = await companymodel.findById(req.params.companyId);

    res.status(200).json({ data: updatedCompany });
});

// ----------------------------------------------------------
exports.delete_company_comments_admin = asyncHandler(async (req, res, next) => {
    if(req.user.role !== "admin"){
        return next(new ApiError(`You can't do this.`, 404));
    }
    // العثور على الشركة والتعليق المطلوب
    const company = await companymodel.findOne({ _id: req.params.companyId, "comments._id": req.params.commentId });

    // التحقق من وجود الشركة والتعليق
    if (!company) {
        return next(new ApiError(`There is no company account for this ID ${req.params.companyId} or comment with ID ${req.params.commentId}.`, 404));
    }

    // استخدام $pull لحذف التعليق
    await companymodel.findOneAndUpdate(
        { _id: req.params.companyId },
        { $pull: { comments: { _id: req.params.commentId } } }
        ,
        {new: true}
    );

    // إعادة استرجاع الشركة المحدثة
    const updatedCompany = await companymodel.findById(req.params.companyId);

    res.status(200).json({ data: updatedCompany });
});

// ---------------------------------------------------------------
exports.create_company_Reviews = asyncHandler(async (req, res, next) => {
    const company = await companymodel.findById(req.params.id);
    if (!company) {
        return next(new ApiError(`There is no company account for this ID ${req.params.id}.`, 404));
    }

    // التحقق مما إذا كان المستخدم قد قام بترك تقييم مسبقًا
    const existingReview = company.reviews.find(review => review.user_review.toString() === req.user._id.toString());
    if (existingReview) {
        return next(new ApiError('You have already left a review for this company.', 400));
    }

    // إضافة التقييم الجديد
    const newReview = {
        rating: req.body.rating,
        user_review: req.user._id
    };
    company.reviews.push(newReview);

    // حساب متوسط التقييمات الجديد
    company.ratingsQuantity = company.reviews.length;
    company.ratingsAverage = company.reviews.reduce((acc, review) => acc + review.rating, 0) / company.ratingsQuantity;

    await company.save();

    res.status(200).json({ data: company });
});

