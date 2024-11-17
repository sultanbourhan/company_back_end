const companymodel = require("../models/companyModels");
const Categoreymodel = require("../models/CategoreyModels");
const Company_requestsmodel = require("../models/Company_requestsModels");
const advertisementsmodel = require("../models/advertisementsModels");
const ApiError = require("../ApiError");
const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const multer = require("multer");
const sharp = require('sharp');
const { v4: uuidv4 } = require("uuid");
const { text } = require("body-parser");
const usermodel = require("../models/userModels");
const path = require("path");
const mongoose = require('mongoose');

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
    { name: 'Image', maxCount: 10 }, // السماح برفع حتى 10 صور
    { name: 'Categoreyimage', maxCount: 1 }
]);

// تستخدم .fields لذا احذف imgcompany و imgcompanyLogo
exports.uploadImages = upload;

// معالجة الصورة الخاصة بالشركة
exports.resizeImg = asyncHandler(async (req, res, next) => {
    if (req.files && req.files.companyImage ) {
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
    if (req.files && req.files.logoImage ) {
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
    if (req.files && req.files.Image ) {
        req.body.Image = [];
        for (let i = 0; i < req.files.Image.length; i++) {
            const file = req.files.Image[i];
            const filename = `company-Image-${uuidv4()}-${Date.now()}.jpeg`;
            await sharp(file.buffer)
                .toFormat("jpeg")
                .jpeg({ quality: 90 })
                .toFile(`image/company/${filename}`);
            req.body.Image.push(`${process.env.BASE_URL}/company/${filename}`);
        }
    }
    next();
});



exports.resizeCategoreyimage = asyncHandler(async (req, res, next) => {
    if (req.files && req.files.Categoreyimage) {
        const file = req.files.Categoreyimage[0]; // يأخذ أول ملف في المصفوفة
        const filename = `company-Categoreyimage-${uuidv4()}-${Date.now()}.jpeg`;
        await sharp(file.buffer)
            .toFormat("jpeg")
            .jpeg({ quality: 90 })
            .toFile(`image/company/${filename}`);

        req.body.Categoreyimage = filename;
    }
    next();
});

// ----------------------------------------------------



// -------------
exports.create_company = asyncHandler(async (req, res, next) => {
    const company_ = await companymodel.findOne({ user: req.body.user });
    if (company_) {
        return next(new ApiError(`There is a company account for the person for whom the account was created.`, 404));
    }

    const calculateEndDate = (type) => {
        const startDate = new Date();
        let endDate;
        switch(type) {
            case 'سنوي':
                endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
                break;
            case 'ثلاث شهور':
                endDate = new Date(startDate.setMonth(startDate.getMonth() + 3));
                break;
            case 'شهري':
                endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
                break;
            default:
                throw new Error('Invalid subscription type');
        }
        return endDate;
    };

    req.body.slug = slugify(req.body.name);

    const endDate = calculateEndDate(req.body.subscriptionType); // تأكد من تمرير نوع الاشتراك هنا

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
        email: req.body.email,
        categorey: req.body.categorey,
        categoreys: req.body.categorey,
        // type: req.body.type,
        Country: req.body.Country,
        city: req.body.city,
        street: req.body.street,
        subscription: {
            type: req.body.subscriptionType,
            startDate: Date.now(),
            endDate: endDate // تحديد تاريخ الانتهاء
        }
    });

    res.status(201).json({ data: company });
});


// ------------------------------------------------------------
// دالة للتعامل مع الطلبات الخاصة بجلب الشركات
exports.get_company = asyncHandler(async (req, res, next) => {
    // تحديد الصفحة والحد من النتائج لكل صفحة
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10000;
    const skip = (page - 1) * limit;

    // تحضير الاستعلام من الطلب وحذف الحقول غير الضرورية
    const reqQuery = { ...req.query };
    const del_for_reqQuery = ["page", "limit", "sort", "fields", "keyword"];
    del_for_reqQuery.forEach((val) => delete reqQuery[val]);

    // تحويل الاستعلام إلى سلسلة نصية لتعديل المشغلين
    let reqQueryStr = JSON.stringify(reqQuery);
    reqQueryStr = reqQueryStr.replace(/\b(gte|lte|lt|gt)\b/g, (match) => `$${match}`);
    let reqQueryJson = JSON.parse(reqQueryStr);

    // حساب عدد الشركات
    const Allcompany = await companymodel.countDocuments();
    
    // إعداد بيانات التصفح
    const pagination = {};
    pagination.page = page;
    pagination.limit = limit;
    pagination.Allcompany = Allcompany;
    pagination.numberOfPage = Math.ceil(Allcompany / limit);

    // تحضير الشروط الأساسية
    let match = { ...reqQueryJson, "subscription.endDate": { $gt: new Date() } };

    // إضافة فلتر الفئة (categoreys) إذا كانت موجودة في الطلب
    if (req.query.categoreys) {
        match['categoreys'] = new mongoose.Types.ObjectId(req.query.categoreys);  // استخدام 'new'
    }

    // إعداد البحث بالكلمات المفتاحية إذا كانت موجودة
    let search = {};
    if (req.query.keyword) {
        search.$or = [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { description: { $regex: req.query.keyword, $options: "i" } },
            { Country: { $regex: req.query.keyword, $options: "i" } },
        ];
    }

    // إعداد خط الأنابيب للتجميع في MongoDB
    let aggregationPipeline = [
        { $match: match },  // تطابق مع معايير الفلترة الأساسية
        { $match: search },  // تطبيق البحث بالكلمات المفتاحية
        { $skip: skip },
        { $limit: limit },
    ];

    // إضافة الفرز إذا كان موجودًا في الطلب
    if (req.query.sort) {
        const sortBy = req.query.sort.split(",").join(" ");
        aggregationPipeline.push({ $sort: { premium: -1 } });  // أو استخدم sortBy إذا كانت مخصصة
    }

    // إضافة الحقول المطلوبة أو استبعاد الحقول غير المطلوبة
    if (req.query.fields) {
        const fieldsBy = req.query.fields.split(",").join(" ");
        aggregationPipeline.push({ $project: { fieldsBy: 1 } });
    } else {
        aggregationPipeline.push({ $project: { "__v": 0 } });
    }

    // تنفيذ التجميع وجلب الشركات
    const companies = await companymodel.aggregate(aggregationPipeline).exec();

    // استخدام populate لاسترجاع البيانات المتعلقة بالـ user و categoreys
    const populatedCompanies = await companymodel.find({ _id: { $in: companies.map(c => c._id) } })
        .populate({ path: 'user' })  // Populate الـ user مع اختيار الحقول المناسبة
        .populate({ path: 'categorey'})  // Populate الـ categoreys مع اختيار الحقول المناسبة
        .exec();

    // إرسال الاستجابة
    res.status(200).json({
        results: populatedCompanies.length,
        pagination,
        data: populatedCompanies
    });
});



// -------------------------------------------------------------
exports.get_company_id =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findById(req.params.id).populate({path: "user"}).populate({path: "categorey"}).populate({path: "comments.user_comment"})

    if(!company){
        return next(new ApiError(`There is no company account for this ID ${req.params.id}.` , 404))
    }
    
    res.status(201).json({data:company})
})


// ------------------------------------------------------
exports.get_company_my =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findOne({user: req.user._id}).populate({path: "user"}).populate({path: "categorey"}).populate({path: "comments.user_comment"})

    if(!company){
        return next(new ApiError(`.ليس لديك حساب شركة.` , 404))
    }

    res.status(201).json({data:company})
})

// --------------------------------------------------------
exports.update_company_my =asyncHandler( async (req, res, next)=>{

    if(req.body.name){
        req.body.slug = slugify(req.body.name)
    }


    const currentCompany = await companymodel.findOne({user : req.user._id});
    if (!currentCompany) {
        return next(new ApiError(`There is no company account for this ${id}.`, 404));
    }

     // تحقق مما إذا كانت companyImage غير موجودة في الطلب
     const companyImage = req.body.companyImage === undefined ? currentCompany.companyImage : `${process.env.BASE_URL}/company/${req.body.companyImage}`;
     const logoImage = req.body.logoImage === undefined ? currentCompany.logoImage : `${process.env.BASE_URL}/company/${req.body.logoImage}`;

    const company = await companymodel.findOneAndUpdate(
        {user : req.user._id},
        {
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
            companyImage,
            logoImage,
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
exports.update_company_id = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    // ابحث عن الشركة الحالية
    const currentCompany = await companymodel.findById(id);
    if (!currentCompany) {
        return next(new ApiError(`There is no company account for this ${id}.`, 404));
    }

    // تحقق مما إذا كانت companyImage غير موجودة في الطلب
    const companyImage = req.body.companyImage === undefined ? currentCompany.companyImage : `${process.env.BASE_URL}/company/${req.body.companyImage}`;
    const logoImage = req.body.logoImage === undefined ? currentCompany.logoImage : `${process.env.BASE_URL}/company/${req.body.logoImage}`;

    // تحديث بيانات الشركة
    if (req.body.name) {
        req.body.slug = slugify(req.body.name);
    }

    const updatedCompany = await companymodel.findOneAndUpdate(
        { _id: id },
        {
            name: req.body.name,
            slug: req.body.slug,
            description: req.body.description,
            companyImage,
            logoImage,
            phone: req.body.phone,
            linkedIn: req.body.linkedIn,
            facebook: req.body.facebook,
            instagram: req.body.instagram,
            email: req.body.email,
            Country: req.body.Country,
            city: req.body.city,
            street: req.body.street,
        },
        { new: true }
    );

    res.status(200).json({ data: updatedCompany });
});


// ---------------------------------------------------------
exports.delete_company_id = asyncHandler(async (req, res, next) => {
    const company = await companymodel.findByIdAndDelete(req.params.id);
    
    if (!company) {
        return next(new ApiError(`There is no company account for this ID: ${req.params.id}.`, 404));
    }

    await advertisementsmodel.deleteMany({ Company: req.params.id });

    res.status(200).json({ message: "Company and related advertisements deleted successfully" });
});

// ----------------------------------------------------------
exports.delete_company_my =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findOneAndDelete({user: req.user._id})

    if(!company){
        return next(new ApiError(`There is no account for your company.` , 404))
    }

    await advertisementsmodel.deleteMany({ Company: company._id });

    res.status(200).json({ message: "Company and related advertisements deleted successfully" });

})

// --------------------------------------------------------------
exports.create_company_advertisements_my =asyncHandler( async (req, res, next)=>{

    const company = await companymodel.findOne({user: req.user._id})

    if(!company){
        return next(new ApiError(`.ليس لديك حساب شركة` , 404))
    }

    // if (company.type === "basic plan") {
    //     const advertisement = await advertisementsmodel.find({
    //         Company: company._id,
    //         createdAt: { $gte: new Date(Date.now() - 178 * 60 * 60 * 1000) }  // إعلانات تم إنشاؤها خلال 178 ساعة الماضية
    //     });

    //     if (advertisement.length > 0) {
    //         return next(new ApiError(`You cannot add another advertisement within 48 hours of the last one.`, 403));
    //     }
    // } else if (company.type === "advanced plan") {
    //     const advertisements = await advertisementsmodel.find({
    //         Company: company._id,
    //         createdAt: { $gte: new Date(Date.now() - 72 * 60 * 60 * 1000) } // إعلانات تم إنشاؤها خلال 72 ساعة الماضية
    //     });

    //     if (advertisements.length > 0) {
    //         return next(new ApiError(`You can only add one advertisement per day.`, 403));
    //     }
    // } else if (company.type === "premium plan") {
    //     const advertisements = await advertisementsmodel.find({
    //         Company: company._id,
    //         createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // إعلانات تم إنشاؤها خلال 24 ساعة الماضية
    //     });

    //     if (advertisements.length > 0) {
    //         return next(new ApiError(`You can only add one advertisement per day.`, 403));
    //     }
    // }


    const advertisement = await advertisementsmodel.find({
                Company: company._id,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }  // إعلانات تم إنشاؤها خلال 24 ساعة الماضية
            });

    if (advertisement.length > 0) {
                return next(new ApiError(`You cannot add another advertisement within 24 hours of the last one.`, 403));
            }
    
    

    const advertisements = await advertisementsmodel.create({
        Image : req.body.Image ,
        title : req.body.title,
        description : req.body.description,
        Company : company._id,
        categorey : company.categorey
    })

    res.status(200).json({data:advertisements})
})

// ---------------------------------------------------------
exports.delete_company_advertisements_my =asyncHandler( async (req, res, next)=>{

    let advertisements = await advertisementsmodel.findById(req.params.id).populate({path : "Company"})

    if(advertisements.Company.user.toString() !== req.user._id.toString()){
        return next(new ApiError(`This ad is not for you` , 404))
    }

    advertisements = await advertisementsmodel.findByIdAndDelete(req.params.id)

    

    res.status(200).send()
})

// ====================================================================
exports.delete_company_advertisements_admin =asyncHandler( async (req, res, next)=>{

    const advertisements = await advertisementsmodel.findByIdAndDelete(req.params.id)

    

    res.status(200).send()
})

// --------------------------------------------------------
exports.get_company_advertisements_my = asyncHandler(async (req, res, next) => {
    
    const advertisements = await advertisementsmodel.find({Company : req.params.id}).populate({path : "Company"});
    
    res.status(200).json({ nam: advertisements.length , data: advertisements });

});

// ------------------------------------------------------------
exports.get_all_company_advertisements = asyncHandler(async (req, res, next) => {
    const filter = {};

    if (req.query.categorey) {
        filter.categorey = req.query.categorey;
    }

    const advertisements = await advertisementsmodel.find(filter).populate({ path: "Company" }).sort({ createdAt: -1 });
    res.status(200).json({ nam: advertisements.length, data: advertisements });
});


exports.get_all_company_advertisements_id = asyncHandler(async (req, res, next) => {


    const advertisements = await advertisementsmodel.find({Company : req.params.id}).populate({path: "Company"});
    res.status(200).json({ nam: advertisements.length, data: advertisements });
});



// -----------------------------------------------------
exports.likes_company_advertisements = asyncHandler(async (req, res, next) => {
    let advertisement = await advertisementsmodel.findById(req.params.id);

    if (!advertisement) {
        return next(new ApiError(`No advertisement found with ID ${req.params.id}`, 404));
    }

    let userAlreadyLiked = false;

    // تحقق مما إذا كان المستخدم قد أعجب بالفعل بالإعلان
    advertisement.likes.forEach((user) => {
        if (user.toString() === req.user._id.toString()) {
            userAlreadyLiked = true;
        }
    });

    if (userAlreadyLiked) {
        advertisement = await advertisementsmodel.findByIdAndUpdate(
            req.params.id,
            { $pull: { likes: req.user._id } },
            { new: true }
        );

        const user = await usermodel.findById(req.user._id)

        user.point -= 2

        await user.save()

    } else {
        advertisement = await advertisementsmodel.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { likes: req.user._id } },
            { new: true }
        );

        const user = await usermodel.findById(req.user._id)

        user.point += 2

        await user.save()
        
    }

    await advertisement.save();

    res.status(200).json({likes : advertisement.likes.length  ,  data: advertisement });
});

// --------------------------------------------------------
exports.create_company_comments = asyncHandler(async (req, res, next) => {
    req.body.user_comment = req.user._id;

    // التحقق مما إذا كان المستخدم قد وضع تعليقًا سابقًا
    const company = await companymodel.findOne({
        _id: req.params.id,
        "comments.user_comment": req.user._id
    });

    if (company) {
        return next(new ApiError('.لقد قمت بالفعل بالتعليق على هذه الشركة', 400));
    }

    // إذا لم يكن هناك تعليق سابق، إضافة التعليق الجديد
    const updatedCompany = await companymodel.findOneAndUpdate(
        { _id: req.params.id },
        { $addToSet: { comments: req.body } },
        { new: true }
    );

    if (!updatedCompany) {
        return next(new ApiError(`There is no company account for this ID ${req.params.id}.`, 404));
    }

    const user = await usermodel.findById(req.user._id);
    user.point += 6;
    await user.save();

    res.status(200).json({ data: updatedCompany });
});

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

    const user = await usermodel.findById(req.user._id);
    user.point -= 6;
    await user.save();

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
    // البحث عن الشركة باستخدام ID
    const company = await companymodel.findById(req.params.id);
    if (!company) {
        return next(new ApiError(`There is no company account for this ID ${req.params.id}.`, 404));
    }

    // التحقق مما إذا كان المستخدم قد قام بترك تقييم مسبقًا
    const existingReview = company.reviews.find(review => review.user_review.toString() === req.user._id.toString());

    if (existingReview) {
        // تعديل التقييم القديم إذا كان موجودًا
        existingReview.rating = req.body.rating;
    } else {
        // إضافة التقييم الجديد إذا لم يكن موجودًا
        const newReview = {
            rating: req.body.rating,
            user_review: req.user._id
        };
        company.reviews.push(newReview);
    }

    // حساب متوسط التقييمات الجديد
    // فلترة التقييمات غير الصالحة قبل الحساب
    const validRatings = company.reviews.filter(review => typeof review.rating === 'number' && !isNaN(review.rating));

    company.ratingsQuantity = validRatings.length;

    if (company.ratingsQuantity > 0) {
        company.ratingsAverage = validRatings.reduce((acc, review) => acc + review.rating, 0) / company.ratingsQuantity;
    } else {
        company.ratingsAverage = 0; // إذا كانت الشركة لا تحتوي على تقييمات صالحة
    }

    // حفظ الشركة مع التقييمات الجديدة أو المعدلة
    await company.save();

    // تحديث نقاط المستخدم
    const user = await usermodel.findById(req.user._id);
    user.point += 8;
    await user.save();

    // إرسال الرد بنجاح
    res.status(200).json({ data: company });
});

// --------------------------------------------------
exports.create_Categorey = asyncHandler(async (req, res, next) =>{
    req.body.slug = slugify(req.body.name);

    const Categorey = await Categoreymodel.create({
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        Categoreyimage: `${process.env.BASE_URL}/company/${req.body.Categoreyimage}`,
    });

    res.status(201).json({ data: Categorey });
})

// --------------------------------------------------
exports.update_Categorey = asyncHandler(async (req, res, next) => {
    if(req.body.name){
        req.body.slug = slugify(req.body.name);
    }

    // قم بتحميل الفئة الحالية
    const currentCategory = await Categoreymodel.findById(req.params.id);

    // تحقق من وجود الفئة
    if (!currentCategory) {
        return next(new ApiError(`There is no category for this ID ${req.params.id}.`, 404));
    }

    // قم بتحديث الفئة
    const updateData = {
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        // قم بتضمين الصورة فقط إذا كانت موجودة في الطلب
        Categoreyimage: req.body.Categoreyimage ? `${process.env.BASE_URL}/company/${req.body.Categoreyimage}` : currentCategory.Categoreyimage
    };

    const Categorey = await Categoreymodel.findByIdAndUpdate(req.params.id, updateData, { new: true });

    res.status(201).json({ data: Categorey });
});


// ---------------------------------------------------------
exports.get_Categorey = asyncHandler(async (req, res, next) =>{

    const Categorey = await Categoreymodel.find()

    res.status(200).json({data : Categorey})
})

exports.get_Categorey_id = asyncHandler(async (req, res, next) =>{

    const Categorey = await Categoreymodel.findById(req.params.id)

    res.status(200).json({data : Categorey})
})

// --------------------------------------------------------
exports.delete_Categorey = asyncHandler(async (req, res, next) =>{

    const Categorey = await Categoreymodel.findByIdAndDelete(req.params.id)

    if(!Categorey){
        return next(new ApiError(`There is no category for this id ${req.params.id}.`, 404))
    }

    res.status(200).send()
})

// -------------------------------------------------------
exports.get_Categorey_company = asyncHandler(async (req, res, next) =>{

    const company = await companymodel.find({categorey : req.params.id})

    const categorey = await Categoreymodel.findById(req.params.id)


    res.status(200).json({categorey : categorey , nam : company.length , data: company })

})

// -----------------------------------------------------
exports.create_Company_requests = asyncHandler(async (req, res, next) =>{

    req.body.slug = slugify(req.body.name);

    const company = await companymodel.findOne({user : req.user._id})

    if(company){
        return next(new ApiError(`You have a company account and you cannot open another account.`, 404))
    }

    const Company_ = await Company_requestsmodel.findOne({user : req.user._id})

    if(Company_){
        return next(new ApiError(`You have a request for a company account and you cannot open another account.`, 404))
    }

    const Company_requests = await Company_requestsmodel.create({
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        companyImage: `${process.env.BASE_URL}/company/${req.body.companyImage}`,
        logoImage: `${process.env.BASE_URL}/company/${req.body.logoImage}`,
        user: req.user._id,
        phone: req.body.phone,
        linkedIn: req.body.linkedIn,
        facebook: req.body.facebook,
        instagram: req.body.instagram,
        email: req.body.email,
        categorey: req.body.categorey,
        type: req.body.type,
        Country : req.body.Country,
        city : req.body.city,
        street : req.body.street,
        subscription : req.body.subscription
    });

    res.status(201).json({ data: Company_requests });
})

// ---------------------------------------------
exports.update_Company_requests = asyncHandler(async (req, res, next) =>{

    if(req.body.name){
        req.body.slug = slugify(req.body.name)
    }

    const Company_requests = await Company_requestsmodel.findOneAndUpdate(
        {user: req.user._id},
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
        categorey: req.body.categorey
        },
        {new: true});

    res.status(201).json({ data: Company_requests });
})

// -------------------------------------------------------------
exports.delete_Company_requests = asyncHandler(async (req, res, next) =>{

    const Company_requests = await Company_requestsmodel.findByIdAndDelete(req.params.id)

    res.status(201).send();

})

// ---------------------------------------------------------------
exports.get_Company_requests_my = asyncHandler(async (req, res, next) =>{

    const Company_requests = await Company_requestsmodel.findOne({user : req.user._id})

    res.status(201).json({ data : Company_requests});

})

// -----------------------------------------------------
exports.get_Company_requests = asyncHandler(async (req, res, next) =>{

    const Company_requests = await Company_requestsmodel.find().populate({path:"user"})

    res.status(201).json({nam : Company_requests.length , data: Company_requests });
    
})

// ----------------------------------------------------------
exports.get_Company_requests_id = asyncHandler(async (req, res, next) =>{

    const Company_requests = await Company_requestsmodel.findById(req.params.id).populate({path:"user"})

    if(!Company_requests){
        return next(new ApiError(`There is no request for a company account for this ID : ${req.params.id}.`, 404))
    }

    res.status(201).json({ data: Company_requests });
    
})

// ------------------------------------------------------------
exports.Accept_Company_requests_admin = asyncHandler(async (req, res, next) =>{
    const Company_requests = await Company_requestsmodel.findById(req.params.id)

    console.log(Company_requests.subscription);

    Company_requests.slug = slugify(Company_requests.name);

    const calculateEndDate = (type) => {
        const startDate = new Date();
        let endDate;
        switch(type) {
            case 'سنوي':
                endDate = new Date(startDate.setFullYear(startDate.getFullYear() + 1));
                break;
            case 'ثلاث شهور':
                endDate = new Date(startDate.setMonth(startDate.getMonth() + 3));
                break;
            case 'شهري':
                endDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
                break;
            default:
                throw new Error('Invalid subscription type');
        }
        return endDate;
    };

    const endDate = calculateEndDate(Company_requests.subscription); // تأكد من تمرير نوع الاشتراك هنا

    const company = await companymodel.create({
        name: Company_requests.name,
        slug: Company_requests.slug,
        description: Company_requests.description,
        companyImage: Company_requests.companyImage,
        logoImage: Company_requests.logoImage,
        user: Company_requests.user,
        phone: Company_requests.phone,
        linkedIn: Company_requests.linkedIn,
        facebook: Company_requests.facebook,
        instagram: Company_requests.instagram,
        email: Company_requests.email,
        categorey: Company_requests.categorey,
        categoreys: Company_requests.categorey,
        Country: Company_requests.Country,
        city: Company_requests.city,
        street: Company_requests.street,
        subscription: {
            type: Company_requests.subscription,
            startDate: Date.now(),
            endDate: endDate // تحديد تاريخ الانتهاء
        }
    });

    const delete_Company_requests = await Company_requestsmodel.findByIdAndDelete(req.params.id)

    res.status(201).json({ data: company });


})

// ---------------------------------------------
exports.delete_Company_requests_admin = asyncHandler(async (req, res, next) =>{
    const Company_requests = await Company_requestsmodel.findByIdAndDelete(req.params.id)

    res.status(200).send()
})

